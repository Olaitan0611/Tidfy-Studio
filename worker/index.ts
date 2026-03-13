export interface Env {
  // Define your environment variables here
  API_URL: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // Example: Proxy all requests starting with /api to an external backend
    if (url.pathname.startsWith('/api')) {
      const backendUrl = new URL(env.API_URL || 'https://api.example.com');
      const targetUrl = new URL(url.pathname + url.search, backendUrl);
      
      const newRequest = new Request(targetUrl.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.body,
        redirect: 'manual',
      });
      
      return fetch(newRequest);
    }
    
    // Default: Continue to the main application (if this worker is sitting in front)
    // Or just return a 404/Welcome message if it's a standalone API worker
    return new Response('Tidfy Edge Worker', { status: 200 });
  },
};
