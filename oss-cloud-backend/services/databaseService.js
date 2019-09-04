const mysql = require('serverless-mysql')({
  config: {
    host: process.env.ENDPOINT,
    port: process.env.PORT,
    database: process.env.DATABASE,
    user: process.env.USER,
    password: process.env.PASSWORD,
  },
});

module.exports.getContributor = (username) => mysql
  .query('SELECT * FROM contributors WHERE username=?', [username]);

module.exports.insertPullRequests = (pullRequests) => {
  const prs = pullRequests.map((pr) => [
    pr.repo,
    pr.owner,
    pr.number,
    pr.link,
    pr.title,
    pr.dateCreated,
    pr.status,
    pr.author,
  ]);
  return mysql.transaction()
    .query('INSERT INTO contributions (repo, owner, number, link, title, dateCreated, status, author) VALUES ?', [prs])
    .rollback((e) => { throw e; })
    .commit();
};

module.exports.getAllContributors = () => mysql.query(
  'SELECT * FROM contributors',
);

module.exports.checkUsername = async (username) => {
  const res = await mysql
    .query('SELECT username FROM contributors WHERE username = ?',
      [username]);
  return res.length !== 0;
};


// saves contributor object in database
// params: contributor
module.exports.addContributor = (contributor) => mysql
  .query('INSERT INTO contributors VALUES(?)',
    [[
      contributor.username,
      contributor.firstName,
      contributor.lastName,
      contributor.link,
      contributor.visibleContributionCount,
    ]]);


module.exports.getAllContributions = () => mysql.query('SELECT * FROM contributions');

module.exports.getContributorPullRequests = (username) => mysql
  .query('SELECT * FROM contributions WHERE author=?', [username]);
