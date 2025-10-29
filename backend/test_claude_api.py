"""
Test script to verify Claude API connection
Run this to check if your ANTHROPIC_API_KEY is configured correctly
"""
import os
from dotenv import load_dotenv
import anthropic

# Load environment variables
load_dotenv()

def test_claude_connection():
    """Test the Claude API connection"""
    print("=" * 60)
    print("Testing Claude API Connection")
    print("=" * 60)
    
    # Check if API key is set
    api_key = os.getenv("ANTHROPIC_API_KEY")
    
    if not api_key:
        print("❌ ANTHROPIC_API_KEY not found in .env file")
        print("\nPlease add your API key to backend/.env:")
        print("ANTHROPIC_API_KEY=sk-ant-your-actual-key-here")
        return False
    
    if api_key == "your-claude-api-key-here":
        print("❌ ANTHROPIC_API_KEY is still set to placeholder value")
        print("\nPlease replace with your actual API key in backend/.env:")
        print("ANTHROPIC_API_KEY=sk-ant-your-actual-key-here")
        return False
    
    print(f"✅ API Key found: {api_key[:15]}...{api_key[-4:]}")
    print("\nTesting connection to Claude API...")
    
    try:
        # Initialize client
        client = anthropic.Anthropic(api_key=api_key)
        
        # Send a simple test message
        response = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=100,
            messages=[
                {
                    "role": "user",
                    "content": "Hi, what is the capital of France?"
                }
            ]
        )
        
        # Extract response
        response_text = response.content[0].text
        
        print("\n" + "=" * 60)
        print("✅ SUCCESS! Claude API is working!")
        print("=" * 60)
        print(f"\nClaude's Response: {response_text}")
        print(f"\nModel: {response.model}")
        print(f"Tokens used: {response.usage.input_tokens} input, {response.usage.output_tokens} output")
        print("\n✅ Your AI assistant is ready to use in the app!")
        return True
        
    except anthropic.AuthenticationError:
        print("\n❌ Authentication Error: Invalid API key")
        print("\nPlease check that your API key is correct in backend/.env")
        return False
        
    except anthropic.APIError as e:
        print(f"\n❌ Claude API Error: {str(e)}")
        return False
        
    except Exception as e:
        print(f"\n❌ Unexpected Error: {str(e)}")
        return False

if __name__ == "__main__":
    test_claude_connection()