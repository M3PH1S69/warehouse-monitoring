// This file can be used to implement a notification system (e.g., using a library like react-toastify).

export const showSuccessNotification = (message: string) => {
  console.log(`SUCCESS: ${message}`);
  // In a real app, you would trigger a toast notification here.
  // alert(`Success: ${message}`);
};

export const showErrorNotification = (message: string) => {
  console.error(`ERROR: ${message}`);
  // In a real app, you would trigger a toast notification here.
  // alert(`Error: ${message}`);
};

// Fix: Added sendTelegramMessage function to resolve import error in Menu.tsx
export const sendTelegramMessage = async (token: string, chatId: string, text: string) => {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text,
    parse_mode: 'Markdown',
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!data.ok) {
      console.error('Error sending Telegram message:', data.description);
      showErrorNotification(`Gagal mengirim notifikasi Telegram: ${data.description}`);
    } else {
      console.log('Telegram message sent successfully.');
    }
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
    if (error instanceof Error) {
      showErrorNotification(`Gagal mengirim notifikasi Telegram: ${error.message}`);
    } else {
      showErrorNotification('Terjadi kesalahan saat mengirim notifikasi Telegram.');
    }
  }
};
