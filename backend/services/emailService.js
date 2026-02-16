import sendMail from "../utils/mailer.js";

const sendEmail = async (to, subject, content, options = {}) => {
  return await sendMail(to, subject, content, options);
};
console.log("FROM_EMAIL =", process.env.FROM_EMAIL);


export default sendEmail;
