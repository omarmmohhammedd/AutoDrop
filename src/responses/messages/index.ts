// global message keys
export type Messages =
  | "new-account"
  | "delete-account"
  | "contact-message"
  | "reset-password";

export type NewAccountKeys = "{{_NAME_}}" | "{{_EMAIL_}}" | "{{_PASSWORD_}}";
export type DeleteAccountKeys = "{{_NAME_}}";
export type ContactMessageKeys =
  | "{{_NAME_}}"
  | "{{_EMAIL_}}"
  | "{{_MESSAGE_}}"
  | "{{_PHONE_}}";

export type ResetPassword = "{{_NAME_}}" | "{{_REDIRECT_}}";

export const messages: Record<Messages, string> = {
  "new-account": `
      <div style="max-width:680px;margin:auto;width:100%;">
        <h3>Welcome dear: {{_NAME_}}.<h3>
        <p>This account was created after the completion of approval of the permissions to use the application in order to be able to use our panel. This account was created with your email registered on the platform, so use that random mail and password</p>
        <p>Email address: {{_EMAIL_}}</p>
        <p>Password: {{_PASSWORD_}}</p>
        <p>Click on next button to redirect to our panel to quick login</p>
        <a href="https://autodrop.me/account/login" style="display:block;width:100%;padding:15px 20px;border-radius:10px;background-color:#111111;color:#ffffff;text-align:center;font-weight:500;width:100%">QUICK LOGIN</a>
        <p>Note that the above password has nothing to do with the password associated with the Basket platform, you can also change it at any time you want from within the panel</p>
      </div>
    `,
  "reset-password": `<div style="max-width:680px;margin:auto;width:100%;">
        <h3>Welcome dear: {{_NAME_}}.<h3>
        <p>It seems that you have forgotten the password for your account, so we have sent that e-mail to you so that you can reset the password. Click on the following button to be redirected to the password reset page. Thank you</p>
        <a href="{{_REDIRECT_}}" style="display:block;width:100%;padding:15px 20px;border-radius:10px;background-color:#111111;color:#ffffff;text-align:center;font-weight:500;width:100%">Reset password now</a>
       
      </div>`,
  "delete-account": `<div style="max-width:680px;margin:auto;width:100%;">
        <h3>Welcome dear: {{_NAME_}}.<h3>
        <p>This e-mail was sent to inform you that your account will be deleted through our platform based on the action that was done by you via your account a while ago, so we would like to inform you that the account and everything related to it will be deleted after 7 days, knowing that you can return Only within that period if you want to reactivate the account, after that you cannot register with that account again. You can create another account through the platform after uninstalling the application and then reinstalling to create a new account.</p>
        <p>Click on next button to redirect to our panel to quick login if you want to reactivate the account.</p>
        <a href="https://autodrop.me/account/login" style="display:block;width:100%;padding:15px 20px;border-radius:10px;background-color:#111111;color:#ffffff;text-align:center;font-weight:500;width:100%">REACTIVATE NOW !!</a>
       
      </div>`,
  "contact-message": `<div style="max-width:680px;margin:auto;width:100%;">
        <h3>Welcome admin.<h3>
        <p>It seems that there is an inquiry by one of the users or visitors, so we have sent this mail to you to present the inquiry to you.</p>
        <p>Name: {{_NAME_}}</p>
        <p>Email address: {{_EMAIL_}}</p>
        <p>Phone number: {{_PHONE_}}</p>
        <p>Message:</p>
        <p style="display:block;width:100%;max-width:fit-content;padding:15px 20px;border-radius:10px;background-color:#11111110;color:#111111;text-align:center;font-weight:500;margin: 10px 0;">{{_MESSAGE_}}</p>
        <p>Click on next button to redirect to our panel to quick login</p>
        <a href="mailto:{{_EMAIL_}}" style="display:block;padding:15px 20px;border-radius:10px;background-color:#111111;color:#ffffff;text-align:center;font-weight:500;width:100%">
        Send message to {{_NAME_}}</a>
      </div>`,
};
