const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'dsyo71ipi',
    api_key: '455835736367272',
    api_secret: 'k-lS4kZ_OnHR3JVp_ndKoDP12UY'
});

async function createPreset() {
    try {
        const result = await cloudinary.api.create_upload_preset({
            name: 'food_app_unsigned',
            unsigned: true,
            folder: 'menu_items',
            allowed_formats: 'jpg,png,jpeg',
            access_mode: 'public'
        });
        console.log("✅ Upload Preset Created Successfully!");
        console.log("Preset Name:", result.name);
        console.log("Unsigned:", result.unsigned);
    } catch (error) {
        if (error.error && error.error.message && error.error.message.includes('already exists')) {
            console.log("⚠️ Preset 'food_app_unsigned' already exists. Using existing one.");
        } else {
            console.error("❌ Error creating preset:", error);
        }
    }
}

createPreset();
