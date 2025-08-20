// BACKUP: Hybrid Version (Keywords + AI)
// Use this if you want to restore the hybrid approach

/**
 * Detect if customer is confirming an order using AI + Keywords (HYBRID VERSION)
 */
async detectOrderConfirmation(message, conversationMemory) {
  const lowerMessage = message.toLowerCase().trim();
  
  // First: Quick keyword check for common confirmations
  const confirmationKeywords = [
    'تمام اكد', 'اكد', 'موافق', 'تمام', 'اوكي', 'ok', 'نعم', 'ايوه', 
    'اه', 'صح', 'كده تمام', 'خلاص', 'اتفقنا', 'موافقة', 'هاخده', 'هاخدها'
  ];
  
  let isConfirming = confirmationKeywords.some(keyword => 
    lowerMessage.includes(keyword)
  );
  
  let detectionMethod = 'keywords';
  
  // Second: If no keyword match, use AI to detect confirmation intent
  if (!isConfirming && message.length > 2) {
    try {
      isConfirming = await this.detectConfirmationWithAI(message, conversationMemory);
      detectionMethod = 'ai';
      console.log(`🤖 AI Confirmation Detection: ${isConfirming ? 'YES' : 'NO'} for message: "${message}"`);
    } catch (error) {
      console.error('❌ AI confirmation detection failed:', error);
      // Fallback to keyword-only detection
    }
  } else if (isConfirming) {
    console.log(`⚡ Keyword Confirmation Detection: YES for message: "${message}"`);
  }
  
  if (!isConfirming) {
    return { isConfirming: false, orderDetails: null };
  }
  
  // Extract order details from conversation memory
  const orderDetails = this.extractOrderDetailsFromMemory(conversationMemory);
  
  return {
    isConfirming: true,
    orderDetails: orderDetails,
    detectionMethod: detectionMethod
  };
}
