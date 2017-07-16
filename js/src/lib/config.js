const electron = require('electron');
const { app } = electron;
const url = require('url');
const os = require('os');
const { version } = require('../../../package.json');

const generateReportIssueUrl = () => {
    const osString = `${os.type()} ${os.arch()} ${os.release()}`;
    const issueLabel = 'user reported';
    const issueBody = `Livre Version: ${version}\nOS: ${osString}`;
    const urlObject = {
        protocol: 'https',
        host: 'github.com',
        pathname: '/livrereader/livre/issues/new',
        query: {
            'labels[]': issueLabel,
            'body': issueBody
        }
    };
    return url.format(urlObject);
};

module.exports = () => {
    if (!app.isReady()) {
        throw new Error('Cannot load config until app is ready');
    }
    return {
        width: electron.screen.getPrimaryDisplay().workAreaSize.width,
        height: electron.screen.getPrimaryDisplay().workAreaSize.height,
        reportIssueUrl: generateReportIssueUrl()
    };
};
