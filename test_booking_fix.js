// Script de test pour valider la correction de l'erreur 500
// Teste le payload exact qui échoue: +2250747666667

async function testBookingFix() {
  const testPayload = {
    venue_id: '3c512a43-8b5c-4e9f-9a1b-2c3d4e5f6a7b', // UUID exemple
    time_slot_id: 'f7abf8df-1234-5678-9abc-def123456789', // UUID exemple
    phone_number: '+2250747666667', // Le numéro qui cause l'erreur
    notes: undefined
  };

  console.log('🧪 Test de correction - Payload:');
  console.log(JSON.stringify(testPayload, null, 2));

  try {
    const response = await fetch('http://localhost:3000/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });

    console.log('\n📊 Réponse HTTP:', response.status);
    
    const result = await response.json();
    console.log('\n📄 Contenu réponse:');
    console.log(JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('\n✅ SUCCESS: La correction fonctionne!');
      console.log('✅ Réservation créée avec succès');
    } else {
      console.log('\n❌ FAILED: Erreur détectée');
      console.log('❌ Status:', response.status);
      console.log('❌ Error:', result.error);
      console.log('❌ Details:', result.details);
    }

  } catch (error) {
    console.log('\n🔥 ERREUR DE TEST:', error.message);
    console.log('🔥 Vérifiez que le serveur est démarré sur localhost:3000');
  }
}

// Exécuter le test
console.log('🚀 Démarrage du test de correction...\n');
testBookingFix();