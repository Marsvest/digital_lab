import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { exec } from 'child_process';
import { options as authOptions } from '../auth/auth1/options';
import { z } from 'zod';
import fs from 'fs';
import util from 'util';

const execPromise = util.promisify(exec);

const githubUrlPattern = /^(https:\/\/|git@)github\.com[/:][\w\-]+\/[\w\-]+(\.git)?$/;

const validationSchema = z.object({
    source: z.string().regex(githubUrlPattern, { message: "Invalid GitHub URL" })
});

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const sourceUrl = formData.get("source") as string;

        const validationResult = validationSchema.safeParse({ source: sourceUrl });

        if (!validationResult.success) {
            return NextResponse.json({ error: validationResult.error.errors }, { status: 400 });
        }

        const username = session.user?.username;
        const password = session.user?.password;

        if (!username || !password) {
            return NextResponse.json({ error: "Missing user credentials" }, { status: 400 });
        }

        const userDirectory = `/var/www/${username}`;

        if (fs.existsSync(userDirectory)) {
            await execPromise(`rm -rf ${userDirectory}/.[!.]* ${userDirectory}/*`);
        } else {
            fs.mkdirSync(userDirectory, { recursive: true });
        }

        await execPromise(`git clone ${sourceUrl} ${userDirectory}`);

        const npmInstallResult = await execPromise(`npm install`, { cwd: userDirectory });
        console.log('npm install output:', npmInstallResult.stdout);

        const npmFundResult = await execPromise(`npm fund`, { cwd: userDirectory });
        console.log('npm fund output:', npmFundResult.stdout);

        const npmBuildResult = await execPromise(`npm run build`, { cwd: userDirectory });
        console.log('npm run build output:', npmBuildResult.stdout);

        const pm2Result = await execPromise(`pm2 start npm --name ${username}-server -- start`, { cwd: userDirectory });
        console.log('pm2 start output:', pm2Result.stdout);

        return NextResponse.json({ message: `Repository cloned successfully to ${userDirectory}` }, { status: 200 });
    } catch (error) {
        console.error('Internal Server Error:', error);
        return NextResponse.json({ error: `Internal Server Error: ${error.message}` }, { status: 500 });
    }
}
