import { NextResponse, NextRequest } from 'next/server';
import { exec } from 'child_process';
import os from 'os';

type User = {
  username: string;
  password: string;
};

type SignInError = {
  type: 'CredentialsSignin';
  message: string;
};

const checkUbuntuUser = (username: string, password: string): Promise<User | SignInError> => {
    return new Promise((resolve, reject) => {
        const platform = os.platform();

        if (platform === 'linux') {
            const command = `echo "${password}" | su - ${username} -c 'exit'`;

            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error('Error validating password:', error);
                    return reject({ type: 'CredentialsSignin', message: 'Invalid username or password' });
                }

                resolve({ username, password });
            });
        } else if (platform === 'win32') {
            resolve({ username, password });
        } else {
            reject({ type: 'CredentialsSignin', message: 'Invalid username or password' });
        }
    });
};

export async function POST(req: NextRequest) {
    const body = await req.json();
    try {
        const { username, password } = body;
        const user = await checkUbuntuUser(username, password);
        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        const signInError = error as SignInError;
        return NextResponse.json({ error: signInError.message }, { status: 401 });
    }
}
