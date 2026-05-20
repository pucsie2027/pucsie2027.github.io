from transformers import pipeline

print("系統提示：正在載入模型。")
print("⚠️ 初次執行會從 Hugging Face 下載約 3GB 的權重檔，這取決於你的網速，請耐心等候幾分鐘...")

# 1. 召喚模型 (建立推論管線)
# device_map="auto" 會自動偵測你的電腦有沒有 GPU，沒有的話會自動切換成 CPU 運算
pipe = pipeline(
    "text-generation", 
    model="Qwen/Qwen2.5-Coder-1.5B-Instruct", 
    device_map="auto"
)

print("\n✅ 模型載入成功！大腦已開機。")

# 2. 準備你要考驗它的錯誤程式碼
buggy_code = """
def calculate_sum(a, b)
    print(a + b)
"""

# 3. 設計提示詞 (Prompt) 告訴它該扮演什麼角色
prompt = f"你是一位專業的 Python 導師。請看以下的程式碼，它缺少了一個很基本但重要的語法符號。請用引導的方式提醒學生，不要直接給他正確答案。\n\n程式碼：\n{buggy_code}\n\n你的提示語："

print("\n🧠 AI 正在思考中...\n")

# 4. 執行推論，讓模型講話
# max_new_tokens 用來限制它講話的長度，避免它囉嗦太多
result = pipe(prompt, max_new_tokens=150)

# 5. 印出結果 (只擷取模型自己生成的部分)
print("========== AI 導師的回覆 ==========")
generated_text = result[0]['generated_text']
# 為了版面乾淨，我們把我們原本問的 prompt 從結果中過濾掉
print(generated_text.replace(prompt, "").strip())
print("===================================")