import { google, oauth2_v2 as oauthV2 } from 'googleapis';
import url from 'url';
import { env } from './env';
import { OAuth2Client } from 'googleapis-common';

export const googleAuth = (redirectUrl?: string): OAuth2Client =>
  new google.auth.OAuth2(
    env.googleAuth.clientId,
    env.googleAuth.secret,
    url.resolve(env.server.gateway_url, redirectUrl || ''),
  );

const defaultScopes = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

export const generateGoogleLoginURL = (
  auth: typeof google.auth.OAuth2.prototype,
  redirectUrl: string,
  state: string,
): string => {
  return auth.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: defaultScopes,
    state: state,
    redirect_uri: url.resolve(env.server.gateway_url, redirectUrl),
  });
};

export const validateGoogleUser = async (
  authCode: string,
  registerAction?: boolean | null,
): Promise<oauthV2.Schema$Userinfoplus | undefined> => {
  try {
    const auth = googleAuth(
      registerAction ? 'auth/google-login/signup' : 'auth/google-login/login',
    );
    const { tokens } = await auth.getToken(authCode);
    auth.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth });
    const result = await oauth2.userinfo.get();
    return result.data;
  } catch (e) {
    return undefined;
  }
};
