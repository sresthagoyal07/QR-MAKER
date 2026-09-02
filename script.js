document.addEventListener('DOMContentLoaded', () => {
    const inputUrl = document.querySelector('.inputurl');
    const generateButton = document.querySelector('.generateBtn');
    const qrContainer = document.querySelector('.qrContainer');
    const downloadBtn = document.querySelector('.downloadBtn');

    if (downloadBtn) {
        downloadBtn.style.display = 'none';
    }

    let qrCode = "";

    generateButton.addEventListener('click', async () => {
        if (!inputUrl) {
            alert('Input field not found in DOM!');
            return;
        }

        const url = inputUrl.value.trim();
        if (!url) {
            alert('Please enter a URL');
            return;
        }

        generateButton.innerHTML = "Generating...";
        generateButton.disabled = true;

        try {
            const response = await fetch("https://srava-qr.onrender.com/generate-qr", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ url: url })
            });

            const data = await response.json();

            if (data.image_base64 || data.image_url) {
                qrCode = data.image_base64 ? `data:image/png;base64,${data.image_base64}` : data.image_url;
                qrContainer.innerHTML = `<img src="${qrCode}" id="qrCode" alt="QR Code" style="max-width: 200px; height: auto;" />`;
                
                if (downloadBtn) {
                    downloadBtn.style.display = 'inline-block';
                }
            } else {
                alert('Failed to generate QR code. Please try again.');
            }
        } catch (error) {
            console.error('Error generating QR code:', error);
            alert('Unable to connect to FastAPI server (http://127.0.0.1:8000)!');
        } finally {
            generateButton.innerHTML = "Generate QR Code";
            generateButton.disabled = false;
        }
    });

    if (downloadBtn) {
        downloadBtn.addEventListener('click', async () => {
            if (!qrCode) return;

            try {
                const response = await fetch(qrCode);
                const blob = await response.blob();
                const bloburl = URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = bloburl;
                link.download = 'SRAVA-QRCode.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                URL.revokeObjectURL(bloburl);
            } catch (error) {
                console.error('Error downloading QR code:', error);
                alert('Error downloading QR code. Please try again.');
            }
        });
    }
});
