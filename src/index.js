import http from "node:http";
import { routes } from "./routes.js";
import { json } from "./middleware/json.js";
import { extractQueryParameters } from "./utils/extract-query-parameters.js";

const server = http.createServer(async (req, res) => {
  const { method, url } = req;

  await json(req, res);

  const route = routes.find((route) => {
    return route.method === method && route.path.test(url);
  });

  if (route) {
    const routeParameters = url.match(route.path);

    const { query, ...parameters } = routeParameters.groups || {};
    req.parameters = parameters;
    req.query = query ? extractQueryParameters(query) : {};

    return route.handler(req, res);
  }

  return res.writeHead(404).end("Not found");
});

server.listen(3334);