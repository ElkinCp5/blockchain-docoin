module.exports = class Channel {
  static instance;
  io = undefined;
  user = {};
  socketId = "";
  constructor(io = undefined) {
    if (!this.io && !io) return Channel.instance;
    if (!!Channel.instance) return Channel.instance;
    Channel.instance = this;
    this.io = io;
  }

  setAuth(user) {
    if (!user) return this.errorEmit("user");
    this.user = user;
  }

  setSocketId(socketId) {
    if (!socketId) return this.errorEmit("socketId");
    this.socketId = socketId;
  }

  //   async public_emit({
  //     type,
  //     channel = "participation",
  //     platform = "dashboard",
  //     data = {},
  //     key,
  //   }) {
  //     const _channel = channels.transactions[channel][platform];
  //     return await this.pubEmit(type, _channel, data, key);
  //   }

  //   async private_emit({
  //     emit: { email },
  //     channel = "participation",
  //     platform = "dashboard",
  //     data = {},
  //     key,
  //   }) {
  //     const _channel = channels.transactions[channel][platform];
  //     return await this.toEmit(email, _channel, data, key);
  //   }

  //   async toEmit(
  //     email,
  //     channel,
  //     data = { title: "", body: "", playload: "" },
  //     prefs = { key: "money", value: 0 }
  //   ) {
  //     if (!this.io) return;
  //     // ENVIAR NOTIFICACION AL USUARIO
  //     console.log(email, { channel: `${email}/${channel}` });
  //     this.io.emit(`${email}/${channel}`, { ...data, prefs });
  //   }

  //   async pubEmit(
  //     type,
  //     channel,
  //     data = { title: "", body: "", playload: "" },
  //     prefs = { key: "money", value: 0 }
  //   ) {
  //     // ENVIAR NOTIFICACION AL USUARIO
  //     console.log(type, { channel: `${type}/${channel}` });
  //     this.io.emit(`${type}/${channel}`, { ...data, prefs });
  //   }

  errorEmit(property) {
    const message = `property ${property} is required!`;
    console.error(message);
    throw new Error(message);
  }
};
