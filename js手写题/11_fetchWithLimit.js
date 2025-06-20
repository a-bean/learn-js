async function fetchWithLimit(urls, limit) {
  const results = [];
  const executing = new Set();

  async function processUrl(url) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      return { url, data, error: null };
    } catch (error) {
      return { url, data: null, error };
    }
  }

  for (const url of urls) {
    const promise = processUrl(url);
    executing.add(promise);

    if (executing.size >= limit) {
      await Promise.race(executing);
    }

    promise.then((result) => {
      executing.delete(promise);
      results.push(result);
    });
  }

  await Promise.allSettled(executing);
  return results.sort((a, b) => urls.indexOf(a.url) - urls.indexOf(b.url));
}

// 测试用例
async function testFetchWithLimit() {
  const urls = [
    "https://jsonplaceholder.typicode.com/posts/1",
    "https://jsonplaceholder.typicode.com/posts/2",
    "https://jsonplaceholder.typicode.com/posts/3",
    "https://jsonplaceholder.typicode.com/posts/4",
    "https://jsonplaceholder.typicode.com/posts/5",
  ];
  const limit = 2;

  const results = await fetchWithLimit(urls, limit);
  console.log(results);
}

testFetchWithLimit();
