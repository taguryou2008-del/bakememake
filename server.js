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
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
    }
}

function sendRoom(room, data) {
    room.players.forEach(player => send(player, data));
}

function sendRoomStatus(room) {
    sendRoom(room, {
        type: "roomStatus",
        roomCode: room.code,
        playerCount: room.players.length
    });
}

function getRoom(ws) {
    if (!ws.roomCode) return null;
    return rooms.get(ws.roomCode) || null;
}

function resetRound(room) {
    room.turnChoices = {};
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
            if (ws.roomCode) return;

            const code = makeRoomCode();

            const room = {
                code,
                players: [ws],
                teams: {},
                turnChoices: {},
                turnNumber: 1,
                started: false
            };

            rooms.set(code, room);

            ws.roomCode = code;
            ws.playerNumber = 1;
            ws.ready = false;

            send(ws, {
                type: "roomCreated",
                roomCode: code,
                playerNumber: 1
            });

            sendRoomStatus(room);
            console.log(`ルーム作成: ${code}`);
            return;
        }

        // ルーム参加
        if (data.type === "joinRoom") {
            if (ws.roomCode) return;

            const code = String(data.roomCode || "");
            const room = rooms.get(code);

            if (!room) {
                send(ws, {
                    type: "error",
                    message: "そのルームは存在しません。"
                });
                return;
            }

            if (room.players.length >= 2 || room.started) {
                send(ws, {
                    type: "error",
                    message: "このルームは満員です。"
                });
                return;
            }

            room.players.push(ws);

            ws.roomCode = code;
            ws.playerNumber = 2;
            ws.ready = false;

            send(ws, {
                type: "roomJoined",
                roomCode: code,
                playerNumber: 2
            });

            sendRoomStatus(room);
            console.log(`ルーム参加: ${code}`);
            return;
        }

        const room = getRoom(ws);
        if (!room || !room.players.includes(ws)) return;

        // 準備完了
        if (data.type === "ready") {
            if (room.started) return;

            ws.ready = true;

            const readyCount = room.players.filter(
                player => player.ready
            ).length;

            sendRoom(room, {
                type: "readyStatus",
                readyCount
            });

            if (
                room.players.length === 2 &&
                readyCount === 2
            ) {
                room.started = true;

                sendRoom(room, {
                    type: "startCharacterSelect"
                });

                console.log(
                    `ルーム${room.code}：キャラクター選択開始`
                );
            }
            return;
        }

        // チーム選択を受信
        if (data.type === "selectTeam") {
            if (!room.started) return;

            if (
                !Array.isArray(data.team) ||
                data.team.length !== 3 ||
                !data.team.every(
                    key => typeof key === "string" &&
                        key.length > 0 &&
                        key.length <= 100
                )
            ) {
                send(ws, {
                    type: "error",
                    message: "チームの選択内容が正しくありません。"
                });
                return;
            }

            room.teams[ws.playerNumber] = data.team;

            send(ws, {
                type: "teamWaiting",
                message: "相手のチーム選択を待っています。"
            });

            // 両方のチームが決まったら開始
            if (room.teams[1] && room.teams[2]) {
                room.turnNumber = 1;
                resetRound(room);

                room.players.forEach(player => {
                    const mine = room.teams[player.playerNumber];
                    const opponentNumber =
                        player.playerNumber === 1 ? 2 : 1;
                    const opponent = room.teams[opponentNumber];

                    send(player, {
                        type: "startOnlineBattle",
                        playerNumber: player.playerNumber,
                        ownTeam: mine,
                        opponentTeam: opponent,
                        turnNumber: room.turnNumber
                    });
                });

                console.log(`ルーム${room.code}：対戦開始`);
            }
            return;
        }

        // 技選択を受信
        if (data.type === "turnChoice") {
            if (!room.teams[1] || !room.teams[2]) return;

            if (data.turnNumber !== room.turnNumber) return;

            if (
                !Number.isInteger(data.skillIndex) ||
                data.skillIndex < 0 ||
                data.skillIndex > 2
            ) {
                send(ws, {
                    type: "error",
                    message: "技の選択が正しくありません。"
                });
                return;
            }

            // 同じターンでの二重送信を防ぐ
            if (room.turnChoices[ws.playerNumber] !== undefined) {
                return;
            }

            room.turnChoices[ws.playerNumber] = data.skillIndex;

            send(ws, {
                type: "turnWaiting",
                turnNumber: room.turnNumber,
                message: "相手の技選択を待っています。"
            });

            // 両方が選んだら両者に送信
            if (
                room.turnChoices[1] !== undefined &&
                room.turnChoices[2] !== undefined
            ) {
                sendRoom(room, {
                    type: "turnResolved",
                    turnNumber: room.turnNumber,
                    player1SkillIndex: room.turnChoices[1],
                    player2SkillIndex: room.turnChoices[2]
                });

                room.turnNumber += 1;
                resetRound(room);
            }
            return;
        }
    });

    ws.on("close", () => {
        console.log("プレイヤーが切断しました");

        const room = getRoom(ws);
        if (!room) return;

        room.players = room.players.filter(
            player => player !== ws
        );

        if (room.players.length === 0) {
            rooms.delete(room.code);
            console.log(`ルーム削除: ${room.code}`);
        } else {
            sendRoom(room, {
                type: "opponentDisconnected",
                message: "相手が切断しました。"
            });

            sendRoomStatus(room);
        }
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
    console.log("ゲームサーバー起動！");
    console.log(`Port: ${PORT}`);
});
