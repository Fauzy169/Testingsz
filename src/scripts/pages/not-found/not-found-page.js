export default class NotFoundPage {
  async render() {
    return `
      <section class="not-found-container">
        <div class="not-found-content">
          <h1>404</h1>
          <h2>Page Not Found</h2>
          <p>The page you're looking for doesn't exist or has been moved.</p>
          <a href="#/" class="home-link">Go to Homepage</a>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // No additional setup needed
  }
}