const readline = require("readline");
const mongoose = require("mongoose");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const Schema = mongoose.Schema;

mongoose.connect("mongodb://127.0.0.1:27017/deneme").then(async () => {
  console.log("MongoDB Bağlandı");
  console.log("Merhaba sisteme hoş geldiniz!");

  const askQuestion = (quest, errMessage) => {
    return new Promise((resolve, reject) => {
      rl.question(quest, (answer) => {
        if (answer) {
          resolve(answer);
        } else {
          console.log(errMessage);
          // Tekrar soru sormak için resolve fonksiyonunu çağır
          resolve(askQuestion(quest, errMessage));
        }
      });
    });
  };

  const main = async () => {
    try {
      const option = (
        await askQuestion(
          "Ne yapmak istersiniz? (oku, yaz, güncelle, sil) :",
          "Seçim işleminde hata oluştu"
        )
      ).toLowerCase();

      switch (option) {
        case "oku":
          await readData();
          break;
        case "yaz":
          await writeData();
          break;
        case "güncelle":
          await updateData();
          break;
        case "sil":
          await deleteData();
          break;

        default:
          console.log("Geçersiz seçim. ");
          processRepeat();
          break;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const dataSchema = new Schema({
    title: String,
    description: String,
    qty: Number,
  });

  const Data = mongoose.model("data", dataSchema);

  const processRepeat = async () => {
    const answer = await askQuestion(
      "Devam etmek istiyormusunuz ? (evet, hayır): ",
      "Seçim işleminde hata oluştu"
    );
    if (answer === "evet") {
      main();
    } else {
      console.log("Programdan çıkıldı");
      mongoose.connection.close();
      rl.close();
    }
  };

  const readData = async () => {
    try {
      const data = await Data.find();
      console.log(data);
      processRepeat();
    } catch (error) {
      console.log("Veri okunurken hata oluştu: ", error);
    }
  };

  const writeData = async () => {
    try {
      const askTitle = await askQuestion(
        "Verinin adını giriniz : ",
        "Veri ismi girilemedi"
      );

      const askDescription = await askQuestion(
        "Verinin tanımını giriniz : ",
        "Veri tanımı girilemedi"
      );

      const askQty = await askQuestion(
        "Verinin miktarını giriniz : ",
        "Veri miktarı girilemedi"
      );

      const newData = new Data({
        title: askTitle,
        description: askDescription,
        qty: askQty,
      });

      await newData.save();

      console.log("Veri eklendi");
      processRepeat();
    } catch (error) {
      console.log("Veri eklerken hata oluştu: ", error);
    }
  };

  const updateData = async () => {
    try {
      const askTitle = await askQuestion(
        "Güncellenecek verinin adını giriniz : ",
        "Veri ismi girilemedi"
      );

      const getData = await askQuestion(
        "Verinin güncellenecek tanımını giriniz : ",
        "Veri tanımı girilemedi"
      );

      // Veriyi bul
      const existingData = await Data.findOne({ title: askTitle });

      // Eğer veri bulunamazsa hata fırlat
      if (!existingData) {
        throw new Error("Belirtilen başlık ile eşleşen veri bulunamadı");
      }

      // Veriyi güncelle
      await Data.findOneAndUpdate(
        { title: askTitle },
        { $set: { description: getData } },
        { new: true }
      );

      console.log("Veri güncellendi");
      processRepeat();
    } catch (error) {
      console.log("Veri güncellenirken hata oluştu: ", error.message);
      processRepeat();
    }
  };

  const deleteData = async () => {
    try {
      const askTitle = await askQuestion(
        "Silmek istediğiniz Verinin adını giriniz : ",
        "Veri ismi girilemedi"
      );

      // Veriyi bul
      const existingData = await Data.findOne({ title: askTitle });

      // Eğer veri bulunamazsa hata fırlat
      if (!existingData) {
        throw new Error("Belirtilen başlık ile eşleşen veri bulunamadı");
      }

      // Veriyi sil
      await Data.findOneAndDelete({ title: askTitle });

      console.log("Veri silindi");
      processRepeat();
    } catch (error) {
      console.log("Veri silinirken hata oluştu: ", error.message);
      processRepeat();
    }
  };

  main();
});
