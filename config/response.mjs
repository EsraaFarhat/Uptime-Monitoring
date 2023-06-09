import MESSAGES from "../shared/messages.mjs";
import { HTTP_CODES } from "../shared/status-codes.mjs";

const response = (req, res, next) => {
  // eslint-disable-next-line default-param-last
  res.ok = (message = MESSAGES.RESPONSE_OK, data) => {
    res.status(HTTP_CODES.SUCCESS.OK).send({
      data: JSON.stringify(data),
      message,
      statusCode: HTTP_CODES.SUCCESS.OK,
    });
  };
  const { send } = res;
  res.send = function (body) {
    if (body.message && typeof body.message === "object") {
      body.message = body.message[req.lang] || JSON.stringify(body.message);
    }
    send.call(this, body);
  };
  return next();
};

export default response;
