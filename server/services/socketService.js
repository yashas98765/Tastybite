const { Server } = require('socket.io');

let io = null;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => callback(null, true),
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`[TastyBite Socket] Client connected: ${socket.id}`);

    // Join order tracking room
    socket.on('join_order_room', (orderId) => {
      socket.join(`order_${orderId}`);
      console.log(`[TastyBite Socket] Socket ${socket.id} joined order room: order_${orderId}`);
    });

    // Join group order room
    socket.on('join_group_room', (groupCode) => {
      socket.join(`group_${groupCode.toUpperCase()}`);
      console.log(`[TastyBite Socket] Socket ${socket.id} joined group room: group_${groupCode}`);
    });

    // Join customer support chat room
    socket.on('join_chat_room', (chatId) => {
      socket.join(`chat_${chatId}`);
      console.log(`[TastyBite Socket] Socket ${socket.id} joined chat room: chat_${chatId}`);
    });

    // Join admin broadcast room
    socket.on('join_admin_room', () => {
      socket.join('admin_channel');
      console.log(`[TastyBite Socket] Socket ${socket.id} joined admin room`);
    });

    socket.on('disconnect', () => {
      console.log(`[TastyBite Socket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized yet');
  }
  return io;
};

// Helper notification emitters
const emitOrderStatusUpdate = (orderId, orderData) => {
  if (io) {
    io.to(`order_${orderId}`).emit('order_status_updated', orderData);
    io.to('admin_channel').emit('admin_order_updated', orderData);
  }
};

const emitGroupOrderUpdate = (groupCode, groupData) => {
  if (io) {
    io.to(`group_${groupCode.toUpperCase()}`).emit('group_order_updated', groupData);
  }
};

const emitNewChatMessage = (chatId, messageData) => {
  if (io) {
    io.to(`chat_${chatId}`).emit('new_chat_message', messageData);
    io.to('admin_channel').emit('admin_chat_notification', messageData);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitOrderStatusUpdate,
  emitGroupOrderUpdate,
  emitNewChatMessage
};
