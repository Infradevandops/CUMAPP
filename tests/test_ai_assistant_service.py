#!/usr/bin/env python3
"""
Unit tests for AI Assistant Service
Tests local language model integration, conversation context management,
and response suggestion algorithms
"""
import pytest
import asyncio
from datetime import datetime, timedelta
from unittest.mock import Mock, patch, AsyncMock
from typing import Dict, List, Any

from services.ai_assistant_service import (
    AIAssistantService,
    ConversationRole,
    IntentType,
    ConversationMessage,
    ConversationContext,
    ResponseSuggestion,
)


class TestAIAssistantService:
    """Test suite for AI Assistant Service"""

    @pytest.fixture
    def ai_service(self):
        """Create AI Assistant service instance for testing"""
        config = {
            "model_name": "test-model",
            "max_tokens": 100,
            "temperature": 0.7,
            "privacy_mode": True,
            "local_processing": True,
        }
        return AIAssistantService(model_config=config)

    @pytest.fixture
    def sample_conversation_context(self):
        """Create sample conversation context for testing"""
        return ConversationContext(
            conversation_id="test_conv_1",
            messages=[
                ConversationMessage(
                    role=ConversationRole.USER,
                    content="Hello, I need help with SMS verification",
                    timestamp=datetime.utcnow(),
                ),
                ConversationMessage(
                    role=ConversationRole.ASSISTANT,
                    content="I'd be happy to help you with SMS verification. What service do you need to verify?",
                    timestamp=datetime.utcnow(),
                ),
            ],
            participants=["user_123", "assistant"],
        )

    def test_service_initialization(self, ai_service):
        """Test AI Assistant service initialization"""
        assert ai_service is not None
        assert ai_service.model_config["model_name"] == "test-model"
        assert ai_service.model_config["privacy_mode"] is True
        assert ai_service.local_model is not None
        assert len(ai_service.response_templates) > 0
        assert len(ai_service.intent_patterns) > 0

    def test_default_configuration(self):
        """Test default configuration creation"""
        service = AIAssistantService()
        config = service.model_config

        assert config["model_name"] == "local-llm-7b"
        assert config["privacy_mode"] is True
        assert config["local_processing"] is True
        assert config["max_tokens"] == 150
        assert config["temperature"] == 0.7

    @pytest.mark.asyncio
    async def test_create_conversation_context(self, ai_service):
        """Test conversation context creation"""
        conversation_id = "test_conv_new"
        participants = ["user_456", "assistant"]
        initial_message = "Hello, I need help"

        context = await ai_service.create_conversation_context(
            conversation_id=conversation_id,
            participants=participants,
            initial_message=initial_message,
        )

        assert context.conversation_id == conversation_id
        assert context.participants == participants
        assert len(context.messages) == 1
        assert context.messages[0].content == initial_message
        assert context.messages[0].role == ConversationRole.USER
        assert conversation_id in ai_service.conversation_contexts

    @pytest.mark.asyncio
    async def test_add_message_to_context(
        self, ai_service, sample_conversation_context
    ):
        """Test adding messages to conversation context"""
        conversation_id = sample_conversation_context.conversation_id
        ai_service.conversation_contexts[conversation_id] = sample_conversation_context

        new_message = "Can you help me verify my WhatsApp account?"
        metadata = {"message_type": "question", "priority": "high"}

        updated_context = await ai_service.add_message_to_context(
            conversation_id=conversation_id,
            role=ConversationRole.USER,
            content=new_message,
            metadata=metadata,
        )

        assert len(updated_context.messages) == 3
        assert updated_context.messages[-1].content == new_message
        assert updated_context.messages[-1].role == ConversationRole.USER
        assert updated_context.messages[-1].metadata == metadata

    @pytest.mark.asyncio
    async def test_add_message_to_nonexistent_context(self, ai_service):
        """Test adding message to non-existent conversation context"""
        with pytest.raises(ValueError, match="Conversation context not found"):
            await ai_service.add_message_to_context(
                conversation_id="nonexistent",
                role=ConversationRole.USER,
                content="Test message",
            )

    @pytest.mark.asyncio
    async def test_analyze_message_intent_greeting(self, ai_service):
        """Test intent analysis for greeting messages"""
        test_cases = [
            "Hello there!",
            "Hi, how are you?",
            "Good morning",
            "Hey, what's up?",
        ]

        for message in test_cases:
            intent, confidence = await ai_service.analyze_message_intent(message)
            assert intent == IntentType.GREETING
            assert 0.0 <= confidence <= 1.0

    @pytest.mark.asyncio
    async def test_analyze_message_intent_question(self, ai_service):
        """Test intent analysis for question messages"""
        test_cases = [
            "What services do you support?",
            "How can I verify my account?",
            "When will my verification be ready?",
            "Can you help me with SMS?",
        ]

        for message in test_cases:
            intent, confidence = await ai_service.analyze_message_intent(message)
            assert intent == IntentType.QUESTION
            assert 0.0 <= confidence <= 1.0

    @pytest.mark.asyncio
    async def test_analyze_message_intent_request(self, ai_service):
        """Test intent analysis for request messages"""
        test_cases = [
            "Please help me verify my account",
            "Can you send me a verification code?",
            "I need to purchase a phone number",
            "Could you assist me with this?",
        ]

        for message in test_cases:
            intent, confidence = await ai_service.analyze_message_intent(message)
            assert intent == IntentType.REQUEST
            assert 0.0 <= confidence <= 1.0

    @pytest.mark.asyncio
    async def test_analyze_message_intent_complaint(self, ai_service):
        """Test intent analysis for complaint messages"""
        test_cases = [
            "This is not working properly",
            "I'm having issues with verification",
            "The service failed again",
            "I'm frustrated with this problem",
        ]

        for message in test_cases:
            intent, confidence = await ai_service.analyze_message_intent(message)
            assert intent == IntentType.COMPLAINT
            assert 0.0 <= confidence <= 1.0

    @pytest.mark.asyncio
    async def test_analyze_message_intent_compliment(self, ai_service):
        """Test intent analysis for compliment messages"""
        test_cases = [
            "Thank you so much for your help!",
            "This service is excellent",
            "Great job with the verification",
            "I appreciate your assistance",
        ]

        for message in test_cases:
            intent, confidence = await ai_service.analyze_message_intent(message)
            assert intent == IntentType.COMPLIMENT
            assert 0.0 <= confidence <= 1.0

    @pytest.mark.asyncio
    async def test_analyze_message_intent_goodbye(self, ai_service):
        """Test intent analysis for goodbye messages"""
        test_cases = [
            "Goodbye, thanks for your help",
            "See you later",
            "Have a great day!",
            "Talk to you soon",
        ]

        for message in test_cases:
            intent, confidence = await ai_service.analyze_message_intent(message)
            assert intent == IntentType.GOODBYE
            assert 0.0 <= confidence <= 1.0

    @pytest.mark.asyncio
    async def test_generate_response_suggestions(self, ai_service):
        """Test response suggestion generation"""
        conversation_id = "test_conv_suggestions"
        incoming_message = "Can you help me verify my WhatsApp account?"

        # Create conversation context
        await ai_service.create_conversation_context(
            conversation_id=conversation_id, participants=["user_789", "assistant"]
        )

        suggestions = await ai_service.generate_response_suggestions(
            conversation_id=conversation_id,
            incoming_message=incoming_message,
            num_suggestions=3,
        )

        assert len(suggestions) == 3
        for suggestion in suggestions:
            assert isinstance(suggestion, ResponseSuggestion)
            assert len(suggestion.text) > 0
            assert 0.0 <= suggestion.confidence <= 1.0
            assert isinstance(suggestion.intent, IntentType)
            assert len(suggestion.tone) > 0
            assert len(suggestion.reasoning) > 0

    @pytest.mark.asyncio
    async def test_provide_contextual_help_verification(self, ai_service):
        """Test contextual help for verification queries"""
        query = "How do I verify my WhatsApp account?"

        help_response = await ai_service.provide_contextual_help(query)

        assert "query" in help_response
        assert "intent" in help_response
        assert "confidence" in help_response
        assert "suggestions" in help_response
        assert "resources" in help_response
        assert "quick_actions" in help_response
        assert help_response["query"] == query

    @pytest.mark.asyncio
    async def test_provide_contextual_help_billing(self, ai_service):
        """Test contextual help for billing queries"""
        query = "How much does it cost to purchase a phone number?"

        help_response = await ai_service.provide_contextual_help(query)

        assert help_response["intent"] == IntentType.QUESTION
        assert len(help_response["suggestions"]) > 0
        assert len(help_response["resources"]) > 0

    @pytest.mark.asyncio
    async def test_enhance_conversation_auto_summary(
        self, ai_service, sample_conversation_context
    ):
        """Test conversation enhancement with auto summary"""
        conversation_id = sample_conversation_context.conversation_id
        ai_service.conversation_contexts[conversation_id] = sample_conversation_context

        enhancements = await ai_service.enhance_conversation(
            conversation_id=conversation_id, enhancement_type="auto"
        )

        assert "summary" in enhancements
        assert "topics" in enhancements
        assert "sentiment" in enhancements
        assert "action_items" in enhancements
        assert enhancements["conversation_id"] == conversation_id

    @pytest.mark.asyncio
    async def test_enhance_conversation_sentiment_only(
        self, ai_service, sample_conversation_context
    ):
        """Test conversation enhancement with sentiment analysis only"""
        conversation_id = sample_conversation_context.conversation_id
        ai_service.conversation_contexts[conversation_id] = sample_conversation_context

        enhancements = await ai_service.enhance_conversation(
            conversation_id=conversation_id, enhancement_type="sentiment"
        )

        assert "sentiment" in enhancements
        assert "overall" in enhancements["sentiment"]
        assert "confidence" in enhancements["sentiment"]
        assert enhancements["sentiment"]["overall"] in [
            "positive",
            "negative",
            "neutral",
        ]

    def test_extract_conversation_topics(self, ai_service, sample_conversation_context):
        """Test topic extraction from conversation"""
        topics = ai_service._extract_conversation_topics(sample_conversation_context)

        assert isinstance(topics, list)
        # Should detect "verification" topic from the sample conversation
        assert any("verification" in topic.lower() for topic in topics)

    def test_analyze_conversation_sentiment_positive(self, ai_service):
        """Test sentiment analysis for positive conversation"""
        context = ConversationContext(
            conversation_id="positive_test",
            messages=[
                ConversationMessage(
                    role=ConversationRole.USER,
                    content="Thank you so much! This service is excellent and I love it!",
                    timestamp=datetime.utcnow(),
                )
            ],
            participants=["user", "assistant"],
        )

        sentiment = ai_service._analyze_conversation_sentiment(context)

        assert sentiment["overall"] == "positive"
        assert sentiment["confidence"] > 0.0

    def test_analyze_conversation_sentiment_negative(self, ai_service):
        """Test sentiment analysis for negative conversation"""
        context = ConversationContext(
            conversation_id="negative_test",
            messages=[
                ConversationMessage(
                    role=ConversationRole.USER,
                    content="This is terrible! I hate this broken service and it's wrong!",
                    timestamp=datetime.utcnow(),
                )
            ],
            participants=["user", "assistant"],
        )

        sentiment = ai_service._analyze_conversation_sentiment(context)

        assert sentiment["overall"] == "negative"
        assert sentiment["confidence"] > 0.0

    def test_analyze_conversation_sentiment_neutral(self, ai_service):
        """Test sentiment analysis for neutral conversation"""
        context = ConversationContext(
            conversation_id="neutral_test",
            messages=[
                ConversationMessage(
                    role=ConversationRole.USER,
                    content="I need information about your services and pricing.",
                    timestamp=datetime.utcnow(),
                )
            ],
            participants=["user", "assistant"],
        )

        sentiment = ai_service._analyze_conversation_sentiment(context)

        assert sentiment["overall"] == "neutral"
        assert sentiment["confidence"] >= 0.0

    def test_extract_action_items(self, ai_service):
        """Test action item extraction from conversation"""
        context = ConversationContext(
            conversation_id="action_test",
            messages=[
                ConversationMessage(
                    role=ConversationRole.USER,
                    content="Please help me verify my account and send me the code",
                    timestamp=datetime.utcnow(),
                ),
                ConversationMessage(
                    role=ConversationRole.USER,
                    content="I need to purchase a phone number for WhatsApp",
                    timestamp=datetime.utcnow(),
                ),
            ],
            participants=["user", "assistant"],
        )

        action_items = ai_service._extract_action_items(context)

        assert isinstance(action_items, list)
        assert len(action_items) > 0
        # Should extract verification and purchase actions
        action_texts = [item["action_text"] for item in action_items]
        assert any("verify" in text.lower() for text in action_texts)

    def test_get_template_suggestions_greeting(self, ai_service):
        """Test template suggestions for greeting intent"""
        suggestions = ai_service._get_template_suggestions(
            IntentType.GREETING, "Hello!"
        )

        assert isinstance(suggestions, list)
        assert len(suggestions) > 0
        assert all(isinstance(s, str) for s in suggestions)

    def test_get_template_suggestions_question(self, ai_service):
        """Test template suggestions for question intent"""
        suggestions = ai_service._get_template_suggestions(
            IntentType.QUESTION, "How does this work?"
        )

        assert isinstance(suggestions, list)
        assert len(suggestions) > 0
        # Should contain acknowledgment phrases
        assert any("question" in s.lower() for s in suggestions)

    def test_determine_tone_helpful(self, ai_service):
        """Test tone determination for helpful suggestions"""
        tone = ai_service._determine_tone(
            "I'd be happy to help you", IntentType.REQUEST
        )
        assert tone == "helpful"

    def test_determine_tone_empathetic(self, ai_service):
        """Test tone determination for empathetic suggestions"""
        tone = ai_service._determine_tone(
            "I understand your frustration", IntentType.COMPLAINT
        )
        assert tone == "empathetic"

    def test_determine_tone_professional(self, ai_service):
        """Test tone determination for professional suggestions"""
        tone = ai_service._determine_tone(
            "Here's the information you requested", IntentType.QUESTION
        )
        assert tone == "professional"

    def test_generate_reasoning_greeting(self, ai_service):
        """Test reasoning generation for greeting responses"""
        reasoning = ai_service._generate_reasoning(
            "Hello! How can I help?", IntentType.GREETING
        )

        assert isinstance(reasoning, str)
        assert len(reasoning) > 0
        assert "greeting" in reasoning.lower()

    def test_generate_reasoning_request(self, ai_service):
        """Test reasoning generation for request responses"""
        reasoning = ai_service._generate_reasoning(
            "I'll help you with that", IntentType.REQUEST
        )

        assert isinstance(reasoning, str)
        assert "request" in reasoning.lower()

    @pytest.mark.asyncio
    async def test_context_window_management(self, ai_service):
        """Test conversation context window management"""
        conversation_id = "window_test"
        participants = ["user", "assistant"]

        # Create context with initial message
        context = await ai_service.create_conversation_context(
            conversation_id=conversation_id, participants=participants
        )

        # Add many messages to test window management
        for i in range(60):  # More than the 50 message limit
            await ai_service.add_message_to_context(
                conversation_id=conversation_id,
                role=(
                    ConversationRole.USER if i % 2 == 0 else ConversationRole.ASSISTANT
                ),
                content=f"Test message {i}",
            )

        final_context = ai_service.conversation_contexts[conversation_id]

        # Should maintain only the last 50 messages
        assert len(final_context.messages) == 50
        assert final_context.messages[-1].content == "Test message 59"

    @pytest.mark.asyncio
    async def test_error_handling_invalid_conversation(self, ai_service):
        """Test error handling for invalid conversation operations"""
        # Test generating suggestions for non-existent conversation
        suggestions = await ai_service.generate_response_suggestions(
            conversation_id="nonexistent", incoming_message="Test message"
        )

        # Should return empty list or handle gracefully
        assert isinstance(suggestions, list)

    @pytest.mark.asyncio
    async def test_error_handling_enhancement_invalid_conversation(self, ai_service):
        """Test error handling for enhancement on invalid conversation"""
        with pytest.raises(ValueError, match="Conversation context not found"):
            await ai_service.enhance_conversation(
                conversation_id="nonexistent", enhancement_type="auto"
            )


if __name__ == "__main__":
    # Example usage and manual testing
    async def test_ai_assistant():
        """Manual test function for AI Assistant service"""
        service = AIAssistantService()

        # Test conversation creation
        context = await service.create_conversation_context(
            conversation_id="manual_test",
            participants=["user_manual", "assistant"],
            initial_message="Hello, I need help with SMS verification",
        )
        print(f"Created conversation: {context.conversation_id}")

        # Test intent analysis
        intent, confidence = await service.analyze_message_intent(
            "Can you help me verify my WhatsApp account?"
        )
        print(f"Intent analysis: {intent.value} (confidence: {confidence:.2f})")

        # Test response suggestions
        suggestions = await service.generate_response_suggestions(
            conversation_id="manual_test",
            incoming_message="I'm having trouble with verification",
            num_suggestions=3,
        )

        print("Response suggestions:")
        for i, suggestion in enumerate(suggestions, 1):
            print(f"  {i}. {suggestion.text}")
            print(f"     Intent: {suggestion.intent.value}, Tone: {suggestion.tone}")
            print(f"     Confidence: {suggestion.confidence:.2f}")
            print(f"     Reasoning: {suggestion.reasoning}")
            print()

    if __name__ == "__main__":
        asyncio.run(test_ai_assistant())
