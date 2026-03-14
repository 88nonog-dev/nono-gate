# Nono Gate Enterprise
**Deterministic Evidence Gate + Transparency Ledger**

## ما هو هذا المنتج؟
Nono Gate Enterprise هو طبقة قرار صارمة تعمل فوق نتائج الفحص (SARIF) لتنتج:
- قرار PASS / FAIL موثّق
- Evidence Bundle غير قابل للعبث (Tamper-evident)
- SHA256 deterministic manifest
- Receipt شفاف مع Merkle inclusion proof
- إمكانية إعادة إنتاج النتيجة بالكامل

هو ليس مجرد “فلتر نتائج” — بل طبقة حوكمة قابلة للتدقيق.

## متى أستخدمه؟
1) CI/CD Gate لمنع إدخال مشاكل جديدة إلى main branch  
2) Audit / Compliance لتقديم حزمة أدلة موقعة تثبت أن القرار لم يتم التلاعب به  
3) Incident Investigation عند الشك في tampering أو تغيير غير مصرح به في النتائج  

## أسرع تشغيل (Quick Start)
مثال Staging جاهز:
node bin/nono.js enterprise --staging examples/acceptance/staging_good --policy examples/acceptance/policy.json --run-id QUICK_TEST

بعد التنفيذ ستجد:
.nono/evidence/QUICK_TEST/

وبداخله:
decision.json, normalized.json, diff.json, baseline_used.json, report.md, SHA256SUMS.txt, BUNDLE_ROOT_SHA256.txt, receipt.json

## Exit Code
0 → PASS  
1 → FAIL  
غير ذلك → خطأ نظامي

## التحقق من Receipt
node bin/nono.js verify --receipt path/to/receipt.json

## ماذا يعني Deterministic هنا؟
إذا استخدمت نفس SARIF + Baseline + Policy + Run ID ستحصل على نفس:
SHA256SUMS.txt و BUNDLE_ROOT_SHA256 و decision.bundle_fingerprint

## أين أذهب بعد ذلك؟
- 09_AUDITOR_WALKTHROUGH.md (الأهم للتدقيق)
- 02_QUICK_RUN_GUIDE.md
- 08_CI_INTEGRATION_GUIDE.md
- 10_FAQ.md
