const aiService = require('../services/aiService');

const chatWithOracle = async (req, res) => {
  try {
    console.log('📨 Chat request received');
    const { message, history = [] } = req.body;

    if (!message || message.trim().length === 0) {
      console.log('❌ Empty message');
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    if (message.length > 500) {
      console.log('❌ Message too long:', message.length);
      return res.status(400).json({
        success: false,
        error: 'Message too long (max 500 characters)'
      });
    }

    console.log('✅ Message validated, calling AI service...');
    const result = await aiService.chat(message, history);

    if (!result.success) {
      console.log('❌ AI service returned error:', result.error);
      return res.status(503).json({
        success: false,
        error: result.message
      });
    }

    console.log('✅ Sending response to client');
    return res.json({
      success: true,
      data: {
        message: result.message,
        role: 'assistant'
      }
    });

  } catch (error) {
    console.error('❌ Controller error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = { chatWithOracle };
