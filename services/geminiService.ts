
import { GoogleGenAI } from "@google/genai";

// Fix: Use the actual GoogleGenAI client as per the guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// 重试配置
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1秒
  maxDelay: 5000   // 5秒
};

// 重试函数
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  retries = RETRY_CONFIG.maxRetries
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      const delay = Math.min(
        RETRY_CONFIG.baseDelay * (RETRY_CONFIG.maxRetries - retries + 1),
        RETRY_CONFIG.maxDelay
      );
      console.log(`重试中... 剩余次数: ${retries}, 延迟: ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1);
    }
    throw error;
  }
};

export const geminiService = {
  translateText: async (text: string, targetLanguage: 'Japanese' | 'Chinese'): Promise<string> => {
    if (!text.trim()) {
      throw new Error('翻译文本不能为空');
    }
    
    console.log(`Translating "${text}" to ${targetLanguage}`);
    
    try {
      return await retryWithBackoff(async () => {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Translate the following text to ${targetLanguage}: "${text}"`,
        });
        
        if (!response.text) {
          throw new Error('翻译服务返回空结果');
        }
        
        return response.text;
      });
    } catch (error) {
      console.error("翻译失败:", error);
      
      // 根据错误类型返回不同的错误信息
      if (error instanceof Error) {
        if (error.message.includes('API_KEY')) {
          throw new Error('API密钥配置错误');
        }
        if (error.message.includes('quota')) {
          throw new Error('API配额已用完');
        }
        if (error.message.includes('network')) {
          throw new Error('网络连接错误');
        }
      }
      
      throw new Error('翻译服务暂时不可用，请稍后重试');
    }
  },

  getLiveInterpretation: async (text: string): Promise<string> => {
    if (!text.trim()) {
      throw new Error('解释文本不能为空');
    }
    
    console.log(`Interpreting "${text}" between Chinese and Japanese`);

    const prompt = `You are a simultaneous interpreter for a live chat. If the following text is in Chinese, translate it to Japanese and prefix with (JP):. If it is in Japanese, translate it to Chinese and prefix with (CN):. If it's in another language like English, translate to both, like (JP): [Japanese translation] (CN): [Chinese translation]. Keep the translation natural and concise for a live chat. Text: "${text}"`;
    
    try {
      return await retryWithBackoff(async () => {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        
        if (!response.text) {
          throw new Error('解释服务返回空结果');
        }
        
        return response.text;
      });
    } catch (error) {
      console.error("实时解释失败:", error);
      
      // 根据错误类型返回不同的错误信息
      if (error instanceof Error) {
        if (error.message.includes('API_KEY')) {
          throw new Error('API密钥配置错误');
        }
        if (error.message.includes('quota')) {
          throw new Error('API配额已用完');
        }
        if (error.message.includes('network')) {
          throw new Error('网络连接错误');
        }
      }
      
      throw new Error('实时解释服务暂时不可用，请稍后重试');
    }
  },
};
