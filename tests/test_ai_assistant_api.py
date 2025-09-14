#!/usr/bin/env python3
"""
Unit tests for AI Assistant API endpoints
Tests API endpoints for AI assistance, contextual help, and intent analysis
"""
import pytest
import json
from datetime import datetime
from unittest.mock import Mock, patch, AsyncMock
from fastapi.testclient import TestClient
from fastapi import FastAPI

from api.ai_assistant_api import router
from services.ai_assistant_service import (
    AIAssistantService,
    ConversationRole,
    IntentType,
    ResponseSuggestion,
    ConversationContext,
    ConversationMessage
)

# Create test app
app = FastAPI()
app.include_router(router)
client = TestClient(app)


class TestAIAssistantAPI:
    """Test suite for AI Assistant API endpoints"""
    
    @pytest.fixture
    def mock_ai_service(self):
        """Create mock AI Assistant service"""
        service = Mock(spec=AIAssistantService)
        service.conversation_contexts = {}
        return service
    
    @pytest.fixture
    def sample_conversation_context(self):
        """Create sample conversation context"""
        return ConversationContext(
            conversation_id="test_conv_1",
            messages=[
                ConversationMessage(
                    role=ConversationRole.USER,
                    content="Hello, I need help",
                    timestamp=datetime.utcnow()
                )
            ],
            participants=["user_123", "assistant"],
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
    
    @pytest.fixture
    def sample_response_suggestion(self):
        """Create sample response suggestion"""
        return ResponseSuggestion(
            text="I'd be happy to help you with that!",
            confidence=0.85,
            intent=IntentType.REQUEST,
            tone="helpful",
            reasoning="Responding to a request with willingness to help",
            alternatives=["I can assist you with that", "Let me help you"]
        )
    
    def test_create_conversation_success(self, mock_ai_service, sample_conversation_context):
        """Test successful conversation creation"""
        mock_ai_service.create_conversation_context.return_value = sample_conversation_context
        
        with patch('api.ai_assistant_api.get_ai_service', return_value=mock_ai_service):
            response = client.post("/api/ai/conversations", json={
                "conversation_id": "test_conv_1",
                "participants": ["user_123", "assistant"],
                "initial_message": "Hello, I need help"
            })
        
        assert response.status_code == 200
        data = response.json()
        assert data["conversation_id"] == "test_conv_1"
        assert data["participants"] == ["user_123", "assistant"]
        assert data["message_count"] == 1
        assert "created_at" in data
        assert "updated_at" in data
    
    def test_create_conversation_invalid_request(self):
        """Test conversation creation with invalid request"""
        response = client.post("/api/ai/conversations", json={
            "conversation_id": "",  # Empty conversation ID
            "participants": ["user_123"]
        })
        
        assert response.status_code == 422  # Validation error
    
    def test_create_conversation_missing_participants(self):
        """Test conversation creation with missing participants"""
        response = client.post("/api/ai/conversations", json={
            "conversation_id": "test_conv",
            "participants": []  # Empty participants list
        })
        
        assert response.status_code == 422  # Validation error
    
    def test_add_message_to_conversation_success(self, mock_ai_service, sample_conversation_context):
        """Test successful message addition to conversation"""
        updated_context = sample_conversation_context
        updated_context.messages.append(ConversationMessage(
            role=ConversationRole.USER,
            content="Can you help me with verification?",
            timestamp=datetime.utcnow()
        ))
        
        mock_ai_service.add_message_to_context.return_value = updated_context
        
        with patch('api.ai_assistant_api.get_ai_service', return_value=mock_ai_service):
            response = client.post("/api/ai/conversations/test_conv_1/messages", json={
                "role": "user",
                "content": "Can you help me with verification?",
                "metadata": {"priority": "high"}
            })
        
        assert response.status_code == 200
        data = response.json()
        assert data["conversation_id"] == "test_conv_1"
        assert data["message_count"] == 2
    
    def test_add_message_invalid_role(self):
        """Test adding message with invalid role"""
        response = client.post("/api/ai/conversations/test_conv_1/messages", json={
            "role": "invalid_role",
            "content": "Test message"
        })
        
        assert response.status_code == 422  # Validation error
    
    def test_add_message_empty_content(self):
        """Test adding message with empty content"""
        response = client.post("/api/ai/conversations/test_conv_1/messages", json={
            "role": "user",
            "content": ""  # Empty content
        })
        
        assert response.status_code == 422  # Validation error
    
    def test_get_conversation_messages_success(self, mock_ai_service, sample_conversation_context):
        """Test successful retrieval of conversation messages"""
        mock_ai_service.conversation_contexts = {"test_conv_1": sample_conversation_context}
        
        with patch('api.ai_assistant_api.get_ai_service', return_value=mock_ai_service):
            response = client.get("/api/ai/conversations/test_conv_1/messages")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 1
        assert data[0]["role"] == "user"
        assert data[0]["content"] == "Hello, I need help"
        assert "timestamp" in data[0]
    
    def test_get_conversation_messages_not_found(self, mock_ai_service):
        """Test retrieval of messages from non-existent conversation"""
        mock_ai_service.conversation_contexts = {}
        
        with patch('api.ai_assistant_api.get_ai_service', return_value=mock_ai_service):
            response = client.get("/api/ai/conversations/nonexistent/messages")
        
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
    
    def test_get_conversation_messages_with_limit(self, mock_ai_service, sample_conversation_context):
        """Test retrieval of conversation messages with limit"""
        # Add more messages to test limit
        for i in range(10):
            sample_conversation_context.messages.append(ConversationMessage(
                role=ConversationRole.USER,
                content=f"Message {i}",
                timestamp=datetime.utcnow()
            ))
        
        mock_ai_service.conversation_contexts = {"test_conv_1": sample_conversation_context}
        
        with patch('api.ai_assistant_api.get_ai_service', return_value=mock_ai_service):
            response = client.get("/api/ai/conversations/test_conv_1/messages?limit=5")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 5  # Should return only last 5 messages
    
    def test_analyze_message_intent_success(self, mock_ai_service):
        """Test successful message intent analysis"""
        mock_ai_service.analyze_message_intent.return_value = (IntentType.QUESTION, 0.92)
        
        with patch('api.ai_assistant_api.get_ai_service', return_value=mock_ai_service):
            response = client.post("/api/ai/analyze-intent", json={
                "message": "How do I verify my WhatsApp account?"
            })
        
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "How do I verify my WhatsApp account?"
        assert data["intent"] == "question"
        assert data["confidence"] == 0.92
        assert "analysis_timestamp" in data
    
    def test_analyze_message_intent_empty_message(self):
        """Test intent analysis with empty message"""
        response = client.post("/api/ai/analyze-intent", json={
            "message": ""  # Empty message
        })
        
        assert response.status_code == 422  # Validation error
    
    def test_generate_response_suggestions_success(self, mock_ai_service, sample_response_suggestion):
        """Test successful response suggestion generation"""
        mock_ai_service.generate_response_suggestions.return_value = [
            sample_response_suggestion,
            ResponseSuggestion(
                text="Let me assist you with that",
                confidence=0.78,
                intent=IntentType.REQUEST,
                tone="professional",
                reasoning="Professional response to request",
                alternatives=[]
            )
        ]
        
        with patch('api.ai_assistant_api.get_ai_service', return_value=mock_ai_service):
            response = client.post("/api/ai/suggest-responses", json={
                "conversation_id": "test_conv_1",
                "incoming_message": "I need help with verification",
                "num_suggestions": 2
            })
        
        assert response.status_code == 200
        data = response.json()
        assert data["conversation_id"] == "test_conv_1"
        assert data["incoming_message"] == "I need help with verification"
        assert len(data["suggestions"]) == 2
        assert data["suggestions"][0]["text"] == "I'd be happy to help you with that!"
        assert data["suggestions"][0]["confidence"] == 0.85
        assert data["suggestions"][0]["intent"] == "request"
        assert data["suggestions"][0]["tone"] == "helpful"
        assert "generated_at" in data
    
    def test_generate_response_suggestions_invalid_num(self):
        """Test response suggestions with invalid number"""
        response = client.post("/api/ai/suggest-responses", json={
            "conversation_id": "test_conv_1",
            "incoming_message": "Test message",
            "num_suggestions": 15  # Exceeds maximum of 10
        })
        
        assert response.status_code == 422  # Validation error
    
    def test_provide_contextual_help_success(self, mock_ai_service):
        """Test successful contextual help provision"""
        mock_ai_service.provide_contextual_help.return_value = {
            "query": "How do I verify my account?",
            "intent": IntentType.QUESTION,
            "confidence": 0.88,
            "suggestions": [
                "I can help you with account verification",
                "Let me guide you through the verification process"
            ],
            "resources": [
                {"title": "Verification Guide", "url": "/docs/verification"},
                {"title": "FAQ", "url": "/docs/faq"}
            ],
            "quick_actions": [
                "Start verification",
                "Check verification status"
            ]
        }
        
        with patch('api.ai_assistant_api.get_ai_service', return_value=mock_ai_service):
            response = client.post("/api/ai/contextual-help", json={
                "query": "How do I verify my account?",
                "context": {"user_type": "new"}
            })
        
        assert response.status_code == 200
        data = response.json()
        assert data["query"] == "How do I verify my account?"
        assert data["intent"] == "question"
        assert data["confidence"] == 0.88
        assert len(data["suggestions"]) == 2
        assert len(data["resources"]) == 2
        assert len(data["quick_actions"]) == 2
        assert "generated_at" in data
    
    def test_provide_contextual_help_empty_query(self):
        """Test contextual help with empty query"""
        response = client.post("/api/ai/contextual-help", json={
            "query": ""  # Empty query
        })
        
        assert response.status_code == 422  # Validation error
    
    def test_enhance_conversation_success(self, mock_ai_service):
        """Test successful conversation enhancement"""
        mock_ai_service.enhance_conversation.return_value = {
            "conversation_id": "test_conv_1",
            "summary": "User requested help with account verification",
            "topics": ["verification", "account"],
            "sentiment": {
                "overall": "neutral",
                "confidence": 0.75
            },
            "action_items": [
                {"action_text": "help with verification", "priority": "medium"}
            ],
            "generated_at": datetime.utcnow()
        }
        
        with patch('api.ai_assistant_api.get_ai_service', return_value=mock_ai_service):
            response = client.post("/api/ai/enhance-conversation", json={
                "conversation_id": "test_conv_1",
                "enhancement_type": "auto"
            })
        
        assert response.status_code == 200
        data = response.json()
        assert data["conversation_id"] == "test_conv_1"
        assert data["enhancement_type"] == "auto"
        assert "enhancements" in data
        assert "generated_at" in data
    
    def test_enhance_conversation_invalid_type(self):
        """Test conversation enhancement with invalid type"""
        response = client.post("/api/ai/enhance-conversation", json={
            "conversation_id": "test_conv_1",
            "enhancement_type": "invalid_type"
        })
        
        assert response.status_code == 422  # Validation error
    
    def test_health_check_success(self, mock_ai_service):
        """Test successful health check"""
        mock_ai_service.local_model = Mock()
        mock_ai_service.conversation_contexts = {"conv1": Mock(), "conv2": Mock()}
        
        with patch('api.ai_assistant_api.get_ai_service', return_value=mock_ai_service):
            response = client.get("/api/ai/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["model_loaded"] is True
        assert data["active_conversations"] == 2
        assert "timestamp" in data
    
    def test_health_check_degraded(self, mock_ai_service):
        """Test health check with degraded status"""
        mock_ai_service.local_model = None  # Model not loaded
        mock_ai_service.conversation_contexts = {}
        
        with patch('api.ai_assistant_api.get_ai_service', return_value=mock_ai_service):
            response = client.get("/api/ai/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "degraded"
        assert data["model_loaded"] is False
        assert data["active_conversations"] == 0
    
    def test_delete_conversation_success(self, mock_ai_service, sample_conversation_context):
        """Test successful conversation deletion"""
        mock_ai_service.conversation_contexts = {"test_conv_1": sample_conversation_context}
        
        with patch('api.ai_assistant_api.get_ai_service', return_value=mock_ai_service):
            response = client.delete("/api/ai/conversations/test_conv_1")
        
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Conversation deleted successfully"
        assert data["conversation_id"] == "test_conv_1"
        assert "deleted_at" in data
    
    def test_delete_conversation_not_found(self, mock_ai_service):
        """Test deletion of non-existent conversation"""
        mock_ai_service.conversation_contexts = {}
        
        with patch('api.ai_assistant_api.get_ai_service', return_value=mock_ai_service):
            response = client.delete("/api/ai/conversations/nonexistent")
        
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
    
    def test_list_conversations_success(self, mock_ai_service, sample_conversation_context):
        """Test successful conversation listing"""
        mock_ai_service.conversation_contexts = {
            "conv1": sample_conversation_context,
            "conv2": ConversationContext(
                conversation_id="conv2",
                messages=[],
                participants=["user_456", "assistant"],
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
        }
        
        with patch('api.ai_assistant_api.get_ai_service', return_value=mock_ai_service):
            response = client.get("/api/ai/conversations")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 2
        assert data[0]["conversation_id"] in ["conv1", "conv2"]
        assert "participants" in data[0]
        assert "message_count" in data[0]
    
    def test_list_conversations_with_limit(self, mock_ai_service):
        """Test conversation listing with limit"""
        # Create multiple conversations
        conversations = {}
        for i in range(10):
            conversations[f"conv_{i}"] = ConversationContext(
                conversation_id=f"conv_{i}",
                messages=[],
                participants=[f"user_{i}", "assistant"],
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
        
        mock_ai_service.conversation_contexts = conversations
        
        with patch('api.ai_assistant_api.get_ai_service', return_value=mock_ai_service):
            response = client.get("/api/ai/conversations?limit=5")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 5  # Should respect the limit
    
    def test_list_conversations_empty(self, mock_ai_service):
        """Test conversation listing when no conversations exist"""
        mock_ai_service.conversation_contexts = {}
        
        with patch('api.ai_assistant_api.get_ai_service', return_value=mock_ai_service):
            response = client.get("/api/ai/conversations")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 0
    
    def test_service_error_handling(self, mock_ai_service):
        """Test API error handling when service fails"""
        mock_ai_service.analyze_message_intent.side_effect = Exception("Service error")
        
        with patch('api.ai_assistant_api.get_ai_service', return_value=mock_ai_service):
            response = client.post("/api/ai/analyze-intent", json={
                "message": "Test message"
            })
        
        assert response.status_code == 500
        assert "Failed to analyze message intent" in response.json()["detail"]
    
    def test_conversation_not_found_error(self, mock_ai_service):
        """Test error handling for conversation not found"""
        mock_ai_service.add_message_to_context.side_effect = ValueError("Conversation context not found")
        
        with patch('api.ai_assistant_api.get_ai_service', return_value=mock_ai_service):
            response = client.post("/api/ai/conversations/nonexistent/messages", json={
                "role": "user",
                "content": "Test message"
            })
        
        assert response.status_code == 400
        assert "Conversation context not found" in response.json()["detail"]


class TestAIAssistantAPIIntegration:
    """Integration tests for AI Assistant API"""
    
    def test_full_conversation_workflow(self):
        """Test complete conversation workflow"""
        # Create conversation
        response = client.post("/api/ai/conversations", json={
            "conversation_id": "integration_test",
            "participants": ["user_integration", "assistant"],
            "initial_message": "Hello, I need help with verification"
        })
        assert response.status_code == 200
        
        # Add message to conversation
        response = client.post("/api/ai/conversations/integration_test/messages", json={
            "role": "user",
            "content": "Can you help me verify my WhatsApp account?"
        })
        assert response.status_code == 200
        
        # Get conversation messages
        response = client.get("/api/ai/conversations/integration_test/messages")
        assert response.status_code == 200
        messages = response.json()
        assert len(messages) >= 1
        
        # Analyze intent
        response = client.post("/api/ai/analyze-intent", json={
            "message": "Can you help me verify my WhatsApp account?"
        })
        assert response.status_code == 200
        
        # Generate suggestions
        response = client.post("/api/ai/suggest-responses", json={
            "conversation_id": "integration_test",
            "incoming_message": "Can you help me verify my WhatsApp account?",
            "num_suggestions": 2
        })
        assert response.status_code == 200
        suggestions = response.json()
        assert len(suggestions["suggestions"]) == 2
        
        # Get contextual help
        response = client.post("/api/ai/contextual-help", json={
            "query": "How do I verify my WhatsApp account?"
        })
        assert response.status_code == 200
        
        # Enhance conversation
        response = client.post("/api/ai/enhance-conversation", json={
            "conversation_id": "integration_test",
            "enhancement_type": "auto"
        })
        assert response.status_code == 200
        
        # Check health
        response = client.get("/api/ai/health")
        assert response.status_code == 200
        
        # List conversations
        response = client.get("/api/ai/conversations")
        assert response.status_code == 200
        conversations = response.json()
        assert any(conv["conversation_id"] == "integration_test" for conv in conversations)
        
        # Delete conversation
        response = client.delete("/api/ai/conversations/integration_test")
        assert response.status_code == 200


if __name__ == "__main__":
    # Run integration test
    test_integration = TestAIAssistantAPIIntegration()
    test_integration.test_full_conversation_workflow()
    print("AI Assistant API integration test completed successfully!")