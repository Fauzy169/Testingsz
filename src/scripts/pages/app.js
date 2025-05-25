import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._setupDrawer();
    this._setupSkipLink();
  }

  _setupSkipLink() {
    const skipLink = document.querySelector('.skip-link');
    skipLink.addEventListener('click', (event) => {
      event.preventDefault();
      this.#content.focus();
      this.#content.scrollIntoView();
    });
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (!this.#navigationDrawer.contains(event.target) && !this.#drawerButton.contains(event.target)) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      })
    });
  }

  async renderPage() {
  const url = getActiveRoute();
  const page = routes[url] || routes['*']; // Fallback ke not found page
  
  try {
    // Coba ambil data dari cache IndexedDB terlebih dahulu
    const dbData = await getAllData();
    if (dbData && dbData.length > 0) {
      // Gunakan data dari cache jika tersedia
      this.#content.innerHTML = await page.render(dbData);
    } else {
      // Jika tidak, render normal
      this.#content.innerHTML = await page.render();
    }
  } catch (error) {
    console.error('Error loading from IndexedDB:', error);
    this.#content.innerHTML = await page.render();
  }
  
  await page.afterRender();
  
  // Simpan data ke IndexedDB setelah render
  if (page.cacheable) {
    try {
      const data = await page.getData(); // Asumsikan page memiliki method getData()
      await saveData(data);
    } catch (error) {
      console.error('Error saving to IndexedDB:', error);
    }
  }
}
}

export default App;
