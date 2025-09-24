"""
Smart Fashion Advisor powered by LangChain and RAG
Provides personalized fashion advice, outfit coordination, and styling recommendations
"""

import os
from typing import List, Dict, Any, Optional
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from langchain_community.llms import Ollama
from langchain_openai import ChatOpenAI
from langchain_community.chat_models import ChatOllama
from langchain.schema import BaseRetriever
from langchain.callbacks.manager import CallbackManagerForRetrieverRun
from langchain.schema import Document
from fashion_knowledge_base import FashionKnowledgeBase
import json
from PIL import Image
import base64
from io import BytesIO

class FashionRetriever(BaseRetriever):
    """Custom retriever for fashion knowledge base"""
    
    def __init__(self, fashion_kb: FashionKnowledgeBase):
        super().__init__()
        self.fashion_kb = fashion_kb
    
    def _get_relevant_documents(
        self, 
        query: str, 
        *, 
        run_manager: CallbackManagerForRetrieverRun
    ) -> List[Document]:
        """Retrieve relevant fashion documents"""
        results = self.fashion_kb.search_knowledge(query, k=5)
        documents = []
        
        for result in results:
            doc = Document(
                page_content=result['content'],
                metadata=result['metadata']
            )
            documents.append(doc)
        
        return documents

class SmartFashionAdvisor:
    def __init__(self, use_openai: bool = True, openai_api_key: Optional[str] = None):
        """
        Initialize Smart Fashion Advisor
        
        Args:
            use_openai: Whether to use OpenAI GPT models (requires API key)
            openai_api_key: OpenAI API key (optional, can be set as environment variable)
        """
        # Initialize fashion knowledge base
        self.fashion_kb = FashionKnowledgeBase()
        
        # Load or build vectorstore
        try:
            self.fashion_kb.load_vectorstore()
        except:
            print("Building new fashion knowledge vectorstore...")
            self.fashion_kb.build_vectorstore()
        
        # Initialize retriever
        self.retriever = FashionRetriever(self.fashion_kb)
        
        # Initialize LLM
        self.llm = self._initialize_llm(use_openai, openai_api_key)
        
        # Create prompt templates
        self.advice_prompt = self._create_advice_prompt()
        self.outfit_prompt = self._create_outfit_prompt()
        self.color_prompt = self._create_color_prompt()
        
        # Initialize chains
        self.advice_chain = RetrievalQA.from_chain_type(
            llm=self.llm,
            chain_type="stuff",
            retriever=self.retriever,
            chain_type_kwargs={"prompt": self.advice_prompt}
        )
    
    def _initialize_llm(self, use_openai: bool, openai_api_key: Optional[str]):
        """Initialize Language Learning Model"""
        if use_openai:
            api_key = openai_api_key or os.getenv("OPENAI_API_KEY")
            if not api_key:
                print("OpenAI API key not found. Falling back to local Ollama model.")
                return ChatOllama(model="llama2", temperature=0.7)
            return ChatOpenAI(
                model="gpt-3.5-turbo",
                temperature=0.7,
                openai_api_key=api_key
            )
        else:
            # Use local Ollama model (requires Ollama to be installed)
            try:
                return ChatOllama(model="llama2", temperature=0.7)
            except:
                print("Ollama not available. Using basic text generation.")
                return None
    
    def _create_advice_prompt(self) -> PromptTemplate:
        """Create prompt template for general fashion advice"""
        template = """
You are a professional fashion stylist and consultant with expertise in color theory, body types, 
seasonal trends, and sustainable fashion. Use the following fashion knowledge to provide personalized,
actionable styling advice.

Fashion Knowledge:
{context}

User Question: {question}

Provide a comprehensive, personalized response that includes:
1. Direct answer to their question
2. Specific recommendations with reasoning
3. Alternative options or variations
4. Pro tips from fashion industry experience

Keep your advice practical, encouraging, and inclusive. Focus on helping them feel confident and stylish.

Fashion Advice:
"""
        return PromptTemplate(template=template, input_variables=["context", "question"])
    
    def _create_outfit_prompt(self) -> PromptTemplate:
        """Create prompt template for outfit recommendations"""
        template = """
You are an expert personal stylist specializing in outfit coordination and wardrobe planning.
Use the following fashion knowledge to create specific outfit recommendations.

Fashion Knowledge:
{context}

Outfit Request: {question}

Create detailed outfit recommendations that include:
1. Complete outfit description (top, bottom, shoes, accessories)
2. Color coordination reasoning
3. Style principles applied
4. Occasion appropriateness
5. Seasonal considerations
6. Body type considerations (if mentioned)
7. Alternative pieces or substitutions

Provide 2-3 complete outfit options with clear explanations for each choice.

Outfit Recommendations:
"""
        return PromptTemplate(template=template, input_variables=["context", "question"])
    
    def _create_color_prompt(self) -> PromptTemplate:
        """Create prompt template for color coordination advice"""
        template = """
You are a color theory expert and fashion consultant. Use the following knowledge about colors
and styling to provide specific color coordination advice.

Fashion Knowledge:
{context}

Color Question: {question}

Provide detailed color advice including:
1. Color theory explanation
2. Specific color combinations
3. Seasonal color palette suggestions
4. How colors affect appearance and mood
5. Practical application tips
6. Colors to avoid and why

Make your advice specific and actionable with clear examples.

Color Coordination Advice:
"""
        return PromptTemplate(template=template, input_variables=["context", "question"])
    
    def get_fashion_advice(self, question: str, advice_type: str = "general") -> Dict[str, Any]:
        """
        Get personalized fashion advice
        
        Args:
            question: User's fashion question
            advice_type: Type of advice (general, outfit, color)
            
        Returns:
            Dictionary containing advice and metadata
        """
        if not self.llm:
            return self._fallback_advice(question, advice_type)
        
        try:
            # Choose appropriate chain based on advice type
            if advice_type == "outfit":
                chain = RetrievalQA.from_chain_type(
                    llm=self.llm,
                    chain_type="stuff",
                    retriever=self.retriever,
                    chain_type_kwargs={"prompt": self.outfit_prompt}
                )
            elif advice_type == "color":
                chain = RetrievalQA.from_chain_type(
                    llm=self.llm,
                    chain_type="stuff",
                    retriever=self.retriever,
                    chain_type_kwargs={"prompt": self.color_prompt}
                )
            else:
                chain = self.advice_chain
            
            # Generate advice
            result = chain.run(question)
            
            # Get relevant knowledge for transparency
            relevant_docs = self.retriever.get_relevant_documents(question)
            
            return {
                "advice": result,
                "type": advice_type,
                "query": question,
                "relevant_knowledge": [doc.metadata.get("topic", "Unknown") for doc in relevant_docs[:3]],
                "confidence": "high" if len(relevant_docs) >= 3 else "medium"
            }
            
        except Exception as e:
            print(f"Error generating advice: {e}")
            return self._fallback_advice(question, advice_type)
    
    def _fallback_advice(self, question: str, advice_type: str) -> Dict[str, Any]:
        """Fallback advice when LLM is not available"""
        # Search knowledge base directly
        results = self.fashion_kb.search_knowledge(question, k=3)
        
        if not results:
            return {
                "advice": "I don't have specific information about that topic. Could you try rephrasing your question?",
                "type": advice_type,
                "query": question,
                "confidence": "low"
            }
        
        # Combine relevant knowledge
        advice_parts = []
        for result in results:
            advice_parts.append(f"**{result['metadata']['topic']}**: {result['content']}")
        
        advice = "\n\n".join(advice_parts)
        
        return {
            "advice": advice,
            "type": advice_type,
            "query": question,
            "relevant_knowledge": [r['metadata']['topic'] for r in results],
            "confidence": "medium"
        }
    
    def analyze_outfit_combination(self, items: List[str], occasion: str = "") -> Dict[str, Any]:
        """
        Analyze a specific outfit combination
        
        Args:
            items: List of clothing items
            occasion: Occasion for the outfit
            
        Returns:
            Analysis of the outfit combination
        """
        items_str = ", ".join(items)
        occasion_str = f" for {occasion}" if occasion else ""
        
        question = f"Analyze this outfit combination: {items_str}{occasion_str}. " \
                  f"Does it work well together? What are the style principles at play? " \
                  f"Any suggestions for improvement?"
        
        return self.get_fashion_advice(question, "outfit")
    
    def get_color_palette_advice(self, base_colors: List[str], season: str = "") -> Dict[str, Any]:
        """
        Get advice for color palette coordination
        
        Args:
            base_colors: List of base colors
            season: Season for color palette
            
        Returns:
            Color coordination advice
        """
        colors_str = ", ".join(base_colors)
        season_str = f" for {season}" if season else ""
        
        question = f"I have these colors in my wardrobe: {colors_str}. " \
                  f"What colors would work well with these{season_str}? " \
                  f"How can I create cohesive outfits using color theory?"
        
        return self.get_fashion_advice(question, "color")
    
    def get_body_type_advice(self, body_type: str, style_goals: str = "") -> Dict[str, Any]:
        """
        Get styling advice for specific body type
        
        Args:
            body_type: Body type (apple, pear, rectangle, hourglass, etc.)
            style_goals: Specific styling goals
            
        Returns:
            Body type specific styling advice
        """
        goals_str = f" My style goals are: {style_goals}." if style_goals else ""
        
        question = f"I have a {body_type} body type.{goals_str} " \
                  f"What styles, cuts, and proportions work best for my body type? " \
                  f"What should I look for when shopping?"
        
        return self.get_fashion_advice(question, "general")
    
    def get_occasion_advice(self, occasion: str, constraints: str = "") -> Dict[str, Any]:
        """
        Get outfit advice for specific occasions
        
        Args:
            occasion: Type of occasion
            constraints: Any constraints (budget, weather, etc.)
            
        Returns:
            Occasion-specific outfit advice
        """
        constraints_str = f" Constraints: {constraints}." if constraints else ""
        
        question = f"I need outfit advice for {occasion}.{constraints_str} " \
                  f"What would be appropriate to wear? Please suggest complete outfit options."
        
        return self.get_fashion_advice(question, "outfit")
    
    def get_trend_advice(self, season: str = "", style_preference: str = "") -> Dict[str, Any]:
        """
        Get current trend advice
        
        Args:
            season: Specific season
            style_preference: Style preference (minimalist, bohemian, etc.)
            
        Returns:
            Trend advice and recommendations
        """
        season_str = f" for {season}" if season else ""
        style_str = f" I prefer {style_preference} style." if style_preference else ""
        
        question = f"What are the current fashion trends{season_str}?{style_str} " \
                  f"How can I incorporate trends into my wardrobe in a timeless way?"
        
        return self.get_fashion_advice(question, "general")

# Example usage and testing
if __name__ == "__main__":
    # Initialize Smart Fashion Advisor
    advisor = SmartFashionAdvisor(use_openai=False)  # Set to True if you have OpenAI API key
    
    # Test different types of advice
    test_cases = [
        {
            "type": "general",
            "question": "I'm 30 years old and work in marketing. How can I build a versatile professional wardrobe?"
        },
        {
            "type": "color",
            "question": "I love wearing blue. What colors work well with different shades of blue?"
        },
        {
            "type": "outfit",
            "question": "I need a cocktail party outfit that's elegant but not too formal."
        }
    ]
    
    print("=== Smart Fashion Advisor Test Results ===\n")
    
    for i, test in enumerate(test_cases, 1):
        print(f"{i}. Testing {test['type']} advice:")
        print(f"   Question: {test['question']}")
        
        result = advisor.get_fashion_advice(test['question'], test['type'])
        
        print(f"   Confidence: {result.get('confidence', 'unknown')}")
        if 'relevant_knowledge' in result:
            print(f"   Based on: {', '.join(result['relevant_knowledge'])}")
        print(f"   Advice: {result['advice'][:200]}...")
        print()