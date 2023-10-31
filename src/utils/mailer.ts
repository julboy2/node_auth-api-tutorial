import config from "config";
import nodemailer, { SendMailOptions } from "nodemailer";
import log from "./logger";

// async function createTestCreds() {
//   const creds = await nodemailer.createTestAccount();

//   // 해당정보를 config default.ts 에 smtp 에 적는다.
//   console.log({ creds });
// }
// createTestCreds();

const smtp = config.get<{
  user: string;
  pass: string;
  host: string;
  port: number;
  secure: boolean;
}>("smtp");

const transporter = nodemailer.createTransport({
  ...smtp,
  auth: { user: smtp.user, pass: smtp.pass },
});

async function sendEmail(payload: SendMailOptions) {
  transporter.sendMail(payload, (err, info) => {
    if (err) {
      log.error(err, "Error sending email");
      return;
    }

    log.info(`Preview URL : ${nodemailer.getTestMessageUrl(info)}`);
  });
}

export default sendEmail;
