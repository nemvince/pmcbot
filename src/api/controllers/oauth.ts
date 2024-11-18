import axios from 'axios';
import { config } from '@/utils/config';
import { client } from '@/discord';
import { prisma } from '@/utils/prisma';
import express from 'express';

interface UserResponse {
    displayName: string;
    id: string;
    mail: string;
}

interface TokenResponse {
    access_token: string;
    refresh_token: string;
}

export const authCallback = async (req: express.Request, res: express.Response) => {
    const { code, state } = req.query;
    const discordUserId = state;

    try {
        const tokenResponse = await axios.post<TokenResponse>(`https://login.microsoftonline.com/${config.microsoft.tenantId}/oauth2/v2.0/token`,
            new URLSearchParams({
                client_id: config.microsoft.clientId,
                client_secret: config.microsoft.clientSecret,
                code: typeof code === 'string' ? code : '',
                redirect_uri: config.microsoft.redirectUri,
                grant_type: 'authorization_code'
            }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
        );

        // Get Microsoft user info
        const userResponse = await axios.get<UserResponse>('https://graph.microsoft.com/v1.0/me', {
            headers: {
                Authorization: `Bearer ${tokenResponse.data.access_token}`
            }
        });

        const user = await prisma.user.findUnique({
            where: { discord_id: discordUserId as string }
        });

        if (!user) {
            await prisma.user.create({
                data: {
                    discord_id: discordUserId as string,
                    microsoft_id: userResponse.data.id,
                    email: userResponse.data.mail,
                    name: userResponse.data.displayName
                }
            });
        } else {
            await prisma.user.update({
                where: { discord_id: discordUserId as string },
                data: {
                    microsoft_id: userResponse.data.id,
                    email: userResponse.data.mail,
                    name: userResponse.data.displayName
                }
            });
        }

        // Notify user through Discord
        if (discordUserId) {
            await client.sendSuccessfulLinkMessage(discordUserId as string);
        }

        res.send('Account linked successfully! You can close this window.');
    } catch (error) {
        console.error('Error during OAuth:', error);
        res.status(500).send('An error occurred during authentication.');
    }
};