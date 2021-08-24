/* eslint-disable @typescript-eslint/no-var-requires, no-undef */
require("dotenv").config()
const fs = require("fs-extra");
const axios = require("axios").default;

const PACKAGE_JSON_PATH = "./package.json";
const CHANGELOG_PATH = "./CHANGELOG.md";

const GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN;
const DISCOURSE_API_KEY = process.env.DISCOURSE_API_KEY;
const DISCOURSE_URL = "https://discourse.joplinapp.org";
const TEMPLATE_PLUGIN_TOPIC_ID = 17470;
const PLUGIN_REPO = "https://www.github.com/joplin/plugin-templates";

const getLatestRelease = async () => {
    const version = JSON.parse(await fs.readFile(PACKAGE_JSON_PATH, "utf-8")).version;
    const changelog = await fs.readFile(CHANGELOG_PATH, "utf-8");

    const releaseHeadings = changelog.match(/###? \[.*/gm);

    const latestReleaseHeading = releaseHeadings[0];
    const secondLatestReleaseHeading = releaseHeadings[1];

    const startIndex = changelog.indexOf(latestReleaseHeading) + latestReleaseHeading.length + 3;
    const endIndex = changelog.indexOf(secondLatestReleaseHeading);

    const latestChangelog = changelog.substr(startIndex, endIndex-startIndex).trim();
    return {
        version: version,
        changelog: latestChangelog
    };
}

const createGithubRelease = async (release) => {
    const tag_name = `v${release.version}`;

    const response = await axios.post(
        "https://api.github.com/repos/joplin/plugin-templates/releases",
        {
            tag_name: tag_name,
            name: tag_name,
            body: release.changelog
        },
        {
            headers: {
                "Authorization": `Token ${GITHUB_ACCESS_TOKEN}`
            }
        });

    return response.data.html_url;
}

const createJoplinReleasePost = async (release) => {
    const postContent = `## Release v${release.version} :rocket:\n${release.changelog}\n\n> For reporting bugs/feature-requests or to know more about the plugin visit the [GitHub Repo](${PLUGIN_REPO}).`;

    const response = await axios.post(
        `${DISCOURSE_URL}/posts.json`,
        {
            topic_id: TEMPLATE_PLUGIN_TOPIC_ID,
            raw: postContent
        },
        {
            headers: {
                "Api-Key": DISCOURSE_API_KEY,
                "Api-Username": "nishantwrp"
            }
        }
    );

    return `${DISCOURSE_URL}/t/${TEMPLATE_PLUGIN_TOPIC_ID}/${response.data.post_number}`;
}

const announceRelease = async () => {
    const release = await getLatestRelease();
    const githubReleaseUrl = await createGithubRelease(release);
    const discoursePostUrl = await createJoplinReleasePost(release);
    console.log("GitHub release created at", githubReleaseUrl);
    console.log("Discourse post created at", discoursePostUrl);
}

announceRelease();
