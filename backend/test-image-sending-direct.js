const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testImageSending() {
  const PAGE_ACCESS_TOKEN = 'EAAUpPO0SIEABPPeKA54mhEnESMUiBKvrXv2ZAZBpku7HrdXSXRkRXH1kZAXE4QoAVkZBXZC9T8BwQS0xFmNbBoqWpRciKQpbl3r537aziZBXgBIsXNvTxx5huZAqhK3I1hogSdaE5OQf075EjkUytaLAc0fkwAVlqsgCuZBddFyH0IigJdtqBZAKxRx1c0JMpGr6XepyfLQhE2R9rO6Q6vETezkFa';
  const recipientId = '23949903971327041';

  console.log('🧪 اختبار إرسال الصور مباشرة...\n');

  // اختبار صور مختلفة
  const testImages = [
    {
      name: 'Picsum Random 1',
      url: 'https://picsum.photos/400/400?random=1'
    },
    {
      name: 'Picsum Random 2', 
      url: 'https://picsum.photos/400/400?random=2'
    },
    {
      name: 'Unsplash Test',
      url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop'
    },
    {
      name: 'JSONPlaceholder',
      url: 'https://via.placeholder.com/400x400/0000FF/FFFFFF?text=Test+Image'
    }
  ];

  for (let i = 0; i < testImages.length; i++) {
    const image = testImages[i];
    console.log(`\n📸 اختبار ${i + 1}: ${image.name}`);
    console.log(`🔗 URL: ${image.url}`);

    try {
      // إرسال الصورة
      const messageData = {
        recipient: {
          id: recipientId
        },
        message: {
          attachment: {
            type: 'image',
            payload: {
              url: image.url
            }
          }
        }
      };

      const response = await fetch(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData)
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log(`✅ نجح إرسال ${image.name} - Message ID: ${responseData.message_id}`);
      } else {
        const error = await response.text();
        console.log(`❌ فشل إرسال ${image.name}:`);
        console.log(`📄 Response: ${error}`);
      }

    } catch (error) {
      console.log(`❌ خطأ في إرسال ${image.name}: ${error.message}`);
    }

    // تأخير بين الصور
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n🏁 انتهى الاختبار');
}

testImageSending().catch(console.error);
