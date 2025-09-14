import os
import hashlib
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import Depends
from sqlalchemy.orm import Session
from models.user_models import APIKey, User
from database import get_db

class APIKeyService:
    def __init__(self, db: Session):
        self.db = db

    def generate_api_key(self, user_id: str, name: str, scopes: Optional[str] = None, expires_in_days: int = 365) -> tuple[APIKey, str]:
        # Generate a random API key
        api_key_plain = os.urandom(32).hex() # 64 character hex string
        key_hash = self._hash_api_key(api_key_plain)
        key_prefix = api_key_plain[:8] # Store first 8 chars for display

        expires_at = datetime.utcnow() + timedelta(days=expires_in_days)

        api_key = APIKey(
            user_id=user_id,
            key_hash=key_hash,
            name=name,
            scopes=scopes,
            expires_at=expires_at
        )
        self.db.add(api_key)
        self.db.commit()
        self.db.refresh(api_key)

        return api_key, f"{key_prefix}.{api_key_plain[8:]}"

    def get_api_keys_for_user(self, user_id: str) -> List[APIKey]:
        return self.db.query(APIKey).filter(APIKey.user_id == user_id).all()

    def revoke_api_key(self, api_key_id: str, user_id: str) -> bool:
        api_key = self.db.query(APIKey).filter(APIKey.id == api_key_id, APIKey.user_id == user_id).first()
        if api_key:
            api_key.is_active = False
            self.db.commit()
            return True
        return False

    def validate_api_key(self, full_api_key: str) -> Optional[APIKey]:
        if '.' not in full_api_key:
            return None
        key_prefix, key_suffix = full_api_key.split('.', 1)
        
        # Find potential API keys by prefix (first 8 chars of the plain key)
        # Note: This requires storing the prefix in the DB, which we are not doing yet.
        # For now, we'll iterate through all active keys and hash them.
        # A more efficient approach would involve storing key_prefix in the DB.

        # For now, we'll just hash the full key and compare.
        # This assumes the stored key_hash is of the full key.
        # If key_hash is of the full key, then key_prefix is not needed for validation.
        
        # Re-hashing the full API key to compare with stored hash
        hashed_input_key = self._hash_api_key(full_api_key)
        
        api_key = self.db.query(APIKey).filter(
            APIKey.key_hash == hashed_input_key,
            APIKey.is_active == True,
            APIKey.expires_at > datetime.utcnow()
        ).first()
        
        if api_key:
            api_key.last_used = datetime.utcnow()
            api_key.total_requests += 1
            api_key.requests_today += 1
            if api_key.last_request_date.date() != datetime.utcnow().date():
                api_key.requests_today = 1 # Reset daily count
            api_key.last_request_date = datetime.utcnow()
            self.db.commit()
            return api_key
        return None

    def _hash_api_key(self, api_key: str) -> str:
        return hashlib.sha256(api_key.encode()).hexdigest()

def get_api_key_service(db: Session = Depends(get_db)) -> APIKeyService:
    return APIKeyService(db)
