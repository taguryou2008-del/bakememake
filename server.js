const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(__dirname));

const rooms = new Map();

function makeRoomCode() {
    let code;

    do {
        code = String(Math.floor(1000 + Math.random() * 9000));
    } while (rooms.has(code));

    return code;
}

function send(ws, data) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
    }
}

function sendRoomStatus(room) {
    const message = {
        type: "roomStatus",
        roomCode: room.code,
        playerCount: room.players.length
    };

    room.players.forEach(player => {
        send(player, message);
    });
}

wss.on("connection", (ws) => {

    console.log("プレイヤーが接続しました");

    ws.on("message", (message) => {

        let data;

        try {
            data = JSON.parse(message);
        } catch {
            return;
        }

        // ルーム作成
        if (data.type === "createRoom") {

            const code = makeRoomCode();

            const room = {
                code: code,
                players: [ws]
            };

            rooms.set(code, room);

            ws.roomCode = code;
            ws.playerNumber = 1;

            send(ws, {
                type: "roomCreated",
                roomCode: code,
                playerNumber: 1
            });

            console.log(`ルーム作成: ${code}`);

            sendRoomStatus(room);
        }

 // ルーム参加
        if (data.type === "joinRoom") {

            const code = String(data.roomCode);
            const room = rooms.get(code);

            if (!room) {
                send(ws, {
                    type: "error",
                    message: "そのルームは存在しません。"
                });
                return;
            }

            if (room.players.length >= 2) {
                send(ws, {
                    type: "error",
                    message: "このルームは満員です。"
                });
                return;
            }

            room.players.push(ws);

            ws.roomCode = code;
            ws.playerNumber = 2;

            send(ws, {
                type: "roomJoined",
                roomCode: code,
                playerNumber: 2
            });

            console.log(`ルーム参加: ${code}`);

            sendRoomStatus(room);
        }

        // 準備完了
        if (data.type === "ready") {

            const room = rooms.get(ws.roomCode);

            if (!room) {
                return;
            }

            ws.ready = true;

            console.log(
                `プレイヤー${ws.playerNumber}が準備完了`
            );

            const readyCount = room.players.filter(
                player => player.ready
            ).length;

            room.players.forEach(player => {
                send(player, {
                    type: "readyStatus",
                    readyCount: readyCount
                });
            });

            // 2人とも準備完了
            if (readyCount === 2) {

                room.players.forEach(player => {
                    send(player, {
                        type: "startCharacterSelect"
                    });
                });

                console.log(
                    `ルーム${room.code}：キャラクター選択開始`
                );
            }
        }
    });

    ws.on("close", () => {

        console.log("プレイヤーが切断しました");

        if (!ws.roomCode) {
            return;
        }

        const room = rooms.get(ws.roomCode);

        if (!room) {
            return;
        }

        room.players = room.players.filter(player => player !== ws);

        if (room.players.length === 0) {
            rooms.delete(ws.roomCode);
            console.log(`ルーム削除: ${ws.roomCode}`);
        } else {
            sendRoomStatus(room);
        }
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
    console.log("ゲームサーバー起動！");
    console.log(`Port: ${PORT}`);
});
