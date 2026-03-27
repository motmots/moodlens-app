import pickle

# Membuka dan membaca file LabelEncoder.pck
with open('LabelEncoder.pck', 'rb') as file:
    le = pickle.load(file)
    
# Menampilkan daftar emosi yang dihafal model
print("Daftar Emosi Model Baru:", le.classes_)