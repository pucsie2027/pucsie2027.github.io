from transformers import pipeline
import warnings

# 忽略一些不影響運作的套件警告，讓終端機畫面更乾淨專業
warnings.filterwarnings("ignore")

print("========== 系統啟動中 ==========")
print("🧠 正在載入 AI 程式導師模型 (Qwen-0.5B)...")

# 1. 召喚輕量級模型 (device_map="auto" 會自動抓你的硬體)
pipe = pipeline(
    "text-generation", 
    model="Qwen/Qwen2.5-Coder-0.5B-Instruct", 
    device_map="auto"
)
print("✅ 模型載入完成！\n")

# 2. 準備你要在台上展示的「錯誤程式碼」
test_code = """
#include <iostream>
using namespace std;
int main() {
    int arr[] = {1, 2, 3};
    cout << arr[3] << endl
    return 0;
}
"""

print("========== 準備輸入的程式碼 ==========")
print(test_code)
print("======================================\n")

# 3. 設計給模型的提示詞 (Prompt)
prompt = f"你是一位嚴格但有耐心的 C++ 程式導師。請找出以下程式碼中的語法與邏輯錯誤，並用繁體中文給出具體的修正建議：\n\n{test_code}\n\n導師的診斷與建議："

print("🔍 助理正在診斷程式碼中，請稍候...\n")

# 4. 執行模型推論
# max_new_tokens 設定 200 字以內，確保它回答精準不囉嗦，加快台上展示速度
result = pipe(prompt, max_new_tokens=200)

# 5. 擷取並印出純淨的回覆內容
output_text = result[0]['generated_text']
clean_answer = output_text.replace(prompt, "").strip()

print("💡 ========== 診斷結果 ==========")
print(clean_answer)
print("=================================")