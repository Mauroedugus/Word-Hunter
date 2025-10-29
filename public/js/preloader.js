export function preloadImages(urls) {
  const promises = urls.map(url => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Falha ao carregar a imagem: ${url}`));
      img.src = url;
    });
  });

  return Promise.all(promises);
}