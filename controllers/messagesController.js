const { getMessages } = require("../services");
const { formatDateFromTimestamp } = require("../utils");

exports.getMessages = (req, res) => {
    if (! req.query.room) {
        res.status(422).send('Missing room number');
        return;
    }

    if (req.query.room != '1' && req.query.room != '2') {
        res.status(422).send('Invalid room number');
        return;
    }

    getMessages(req.query.room)
        .then((last100Messages) => {
            last100Messages = last100Messages.docs;
            last100Messages = last100Messages.map((msg) => {
                msg = msg.data();
                msg.createdAt = formatDateFromTimestamp(msg.createdAt);

                return msg;
            });
            last100Messages.reverse();
            
            res.send(last100Messages);
        })
        .catch((err) => {
            res.status(500).send(err);
        });
}
