const { Octokit } = require("@octokit/rest");

const accessToken = "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";
const octokit = new Octokit({
    auth: accessToken,
});
async function getAuthenticatedUser() {
    try {
        const response = await octokit.users.getAuthenticated();
        return response.data;
    } catch (error) {
        console.error("Error fetching user:", error.message);
        return null;
    }
}

async function createNewFile() {
    await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
        owner: "M-sasank",
        repo: 'arweave-hackathon',
        path: 'arweave-hackathon/example.yml',
        message: 'hey there',
        committer: {
            name: 'Sasank Madati',
            email: 'sasankmadati@gmail.com'
        },
        content: 'bmFtZTogQnVpbGQgdGhlIHN0YXRpYyBXZWJzaXRlCnJ1bi1uYW1lOiAke3sgZ2l0aHViLmFjdG9yIH19IGlzIGJ1aWxkaW5nIGFuZCBwdXNoaW5nIGludG8gYXJkcml2ZQpvbjogW3B1c2hdCmpvYnM6CiAgYnVpbGQ6CiAgICBydW5zLW9uOiB1YnVudHUtbGF0ZXN0CiAgICBzdGVwczoKICAgICAgLSB1c2VzOiBhY3Rpb25zL2NoZWNrb3V0QHYzCiAgICAgIC0gdXNlczogYWN0aW9ucy9zZXR1cC1ub2RlQHYzCiAgICAgICAgd2l0aDoKICAgICAgICAgIG5vZGUtdmVyc2lvbjogJzE3JwogICAgICAtIG5hbWU6IEluc3RhbGwgQXJkcml2ZQogICAgICAgIHJ1bjogfAogICAgICAgICAgbnBtIGluc3RhbGwgLWcgYXJkcml2ZS1jbGkgLS1zaWxlbnQKICAgICAgICAgIG5wbSB1cGRhdGUgLWcgYXJkcml2ZS1jbGkgLS1zaWxlbnQKICAgICAgICAgIGVjaG8gIkxhdGVzdCBBcmRyaXZlIGluc3RhbGxlZCIKICAgICAgICAgIGFyZHJpdmUgZ2V0LWFkZHJlc3MgLXMgIiRwYXNzcGhyYXNlIgogICAgICAgICAgYXJkcml2ZSBnZXQtYmFsYW5jZSAtYSAiJGRyaXZlaWQiCiAgICAgIC0gbmFtZTogQnVpbGQgdGhlIHN0YXRpYyB3ZWJzaXRlCiAgICAgICAgcnVuOiB8CiAgICAgICAgIGNkIHN0YXRpYy13ZWJzaXRlCiAgICAgICAgIG5wbSBpbnN0YWxsIC0tc2lsZW50CiAgICAgICAgIG5wbSBydW4gYnVpbGQgLS1zaWxlbnQKICAgICAgICAgbHMKICAgICAgICAgZWNobyAiQnVpbGQgY29tcGxldGUiCg==',
        headers: {
            'X-GitHub-Api-Version': '2022-11-28'
        }
    })
}


createNewFile();

