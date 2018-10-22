// Conditionally load it, so people can use babel-node as well
if (!global._babelPolyfill) {
  require('babel-polyfill');
}

const express = require('express');
const mjml = require('mjml').default;
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const Boom = require('boom');

const renderReact = (component, data) => {
  const rootElemComponent = React.createElement(component, data);
  return ReactDOMServer.renderToStaticMarkup(rootElemComponent);
};

const createMail = (template, type, data, response) => {
  // pick the component given some criteria, in this case depends on the URL
  const component = require(`./templates/${template}.js`);

  try {
    // render component as static markup
    const staticHtml = renderReact(component, data);
    // send the markup to mjml
    const rendered = mjml(staticHtml, {
      level: 'strict', // enable good practices of mjml
    });

    if (rendered.errors.length)
      throw new Error(
        `There was a problem when trying to parse with mjml`,
        rendered.errors,
      );

    response.send(rendered.html).end();
  } catch (e) {
    console.error(`Error occured while rendering: "${e}"`);
    response.status(500).end();
  }
};

const port = process.env.PORT || 3000;

const server = express();

server.get('/:template.:type', (req, res) =>
  createMail(req.params.template, req.params.type, req.query, res),
);

server.listen(port, () => console.info('Server is ready'));
