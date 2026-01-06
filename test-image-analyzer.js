// Simple test to check if image URL is reachable
const testUrl = "https://auth.genpire.com/storage/v1/object/public/fileuploads/uploads/test/test.jpg";

fetch(testUrl, { method: 'HEAD' })
  .then(response => {
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    if (response.status === 404) {
      console.log('Image does not exist at this URL');
    }
  })
  .catch(error => {
    console.error('Error:', error.message);
  });
