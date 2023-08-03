const express = require('express');
const { Octokit } = require("@octokit/rest");

const app = express();

const accessToken = process.env.GITHUB_TOKEN;
const octokit = new Octokit({
    auth: accessToken,
});

async function createOrUpdateWorkflow(user, repository, filePath) {
    try {
        // Checking for file
        const { data: existingFile } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
            owner: user,
            repo: repository,
            path: filePath,
        })

        await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
            owner: user,
            repo: repository,
            path: filePath,
            message: 'updated workflow',
            committer: {
                name: 'Sasank Madati',
                email: 'sasankmadati@gmail.com'
            },
            content: 'bmFtZTogVGVzdCBmb3IgdXBkYXRlIG5ldyBmaWxlCm9uOiBbcHVzaF0Kam9iczoKICBidWlsZDoKICAgIHJ1bnMtb246IHVidW50dS1sYXRlc3QKICAgIHN0ZXBzOgogICAgICAtIHVzZXM6IGFjdGlvbnMvY2hlY2tvdXRAdjMKICAgICAgLSBuYW1lOiBJbnN0YWxsIEFyZHJpdmUKICAgICAgICBydW46IHwKICAgICAgICAgIGVjaG8gIkxhdGVzdCBBcmRyaXZlIGluc3RhbGxlZCI=',
            sha: existingFile.sha,
        })
        console.log(`File is updated successfully!`);
    }
    catch (error) {
        console.log(`File not found! Created a new file.`);
        await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
            owner: user,
            repo: repository,
            path: filePath,
            message: 'hey there',
            committer: {
                name: 'Sasank Madati',
                email: 'sasankmadati@gmail.com'
            },
            content: 'bmFtZTogQnVpbGQgdGhlIHN0YXRpYyBXZWJzaXRlCnJ1bi1uYW1lOiAke3sgZ2l0aHViLmFjdG9yIH19IGlzIGJ1aWxkaW5nIGFuZCBwdXNoaW5nIGludG8gYXJkcml2ZQpvbjogW3B1c2hdCmpvYnM6CiAgYnVpbGQ6CiAgICBydW5zLW9uOiB1YnVudHUtbGF0ZXN0CiAgICBzdGVwczoKICAgICAgLSB1c2VzOiBhY3Rpb25zL2NoZWNrb3V0QHYzCiAgICAgIC0gdXNlczogYWN0aW9ucy9zZXR1cC1ub2RlQHYzCiAgICAgICAgd2l0aDoKICAgICAgICAgIG5vZGUtdmVyc2lvbjogJzE3JwogICAgICAtIG5hbWU6IEluc3RhbGwgQXJkcml2ZQogICAgICAgIHJ1bjogfAogICAgICAgICAgZWNobyAiTGF0ZXN0IEFyZHJpdmUgaW5zdGFsbGVkIg==',
        })
    }
}

app.get('/addWorkflow', (req, res) => {
    user = "M-sasank";
    repository = 'arweave-hackathon';
    filePath = '.github/workflows/blank.yaml';
    createOrUpdateWorkflow(user, repository, filePath);
    res.send("Hello World!");
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
