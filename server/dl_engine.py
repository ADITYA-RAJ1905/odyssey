import torch
import torch.nn as nn
import torch.optim as optim
import torch.nn.functional as F
import numpy as np
from typing import Dict, Any, List

# Ensure reproducible seeds for educational consistency
torch.manual_seed(42)
np.random.seed(42)

# --- Synthetic 2D Classification Data for MLP Training ---
def generate_2d_dataset(n_samples=300, noise=0.15):
    # Two concentric rings / spiral decision boundary
    n = n_samples // 2
    r1 = np.random.uniform(0.1, 0.45, n)
    theta1 = np.random.uniform(0, 2 * np.pi, n)
    X1 = np.stack([r1 * np.cos(theta1) + np.random.normal(0, noise, n),
                   r1 * np.sin(theta1) + np.random.normal(0, noise, n)], axis=1)
    y1 = np.zeros(n, dtype=np.int64)

    r2 = np.random.uniform(0.6, 1.0, n)
    theta2 = np.random.uniform(0, 2 * np.pi, n)
    X2 = np.stack([r2 * np.cos(theta2) + np.random.normal(0, noise, n),
                   r2 * np.sin(theta2) + np.random.normal(0, noise, n)], axis=1)
    y2 = np.ones(n, dtype=np.int64)

    X = np.vstack([X1, X2])
    y = np.concatenate([y1, y2])
    indices = np.random.permutation(len(X))
    return X[indices], y[indices]

class DynamicMLP(nn.Module):
    def __init__(self, layer_sizes: List[int], activations: List[str]):
        super().__init__()
        self.layers = nn.ModuleList()
        self.activations = activations
        for i in range(len(layer_sizes) - 1):
            self.layers.append(nn.Linear(layer_sizes[i], layer_sizes[i+1]))

    def forward(self, x, capture_intermediates=False):
        activations_record = []
        curr = x
        if capture_intermediates:
            activations_record.append({"layer": "input", "values": curr.detach().cpu().numpy().tolist()})

        for i, layer in enumerate(self.layers):
            curr = layer(curr)
            act_type = self.activations[i] if i < len(self.activations) else "none"
            if act_type == "relu":
                curr = F.relu(curr)
            elif act_type == "sigmoid":
                curr = torch.sigmoid(curr)
            elif act_type == "tanh":
                curr = torch.tanh(curr)
            elif act_type == "softmax":
                curr = F.softmax(curr, dim=-1)

            if capture_intermediates:
                activations_record.append({
                    "layer": f"layer_{i+1}",
                    "activation": act_type,
                    "values": curr.detach().cpu().numpy().tolist()
                })
        return curr, activations_record

# --- Real Small CNN for Ancient Glyphs ---
# 4 Ancient Island Glyph Classes: 0: Compass, 1: Storm, 2: Rune, 3: Relic
GLYPH_NAMES = ["Compass", "Storm", "Rune", "Relic"]

def generate_glyph_dataset(num_samples=160):
    # Generates 8x8 binary/grayscale glyph patterns with noise
    X = []
    y = []
    for _ in range(num_samples // 4):
        # 0: Compass (Plus / Cross)
        img0 = np.zeros((8, 8), dtype=np.float32)
        img0[3:5, :] = 0.9
        img0[:, 3:5] = 0.9
        img0 += np.random.normal(0, 0.1, (8, 8))
        X.append(np.clip(img0, 0, 1))
        y.append(0)

        # 1: Storm (Diagonal waves)
        img1 = np.zeros((8, 8), dtype=np.float32)
        for i in range(8):
            img1[i, i] = 0.95
            if i > 0: img1[i-1, i] = 0.6
            if i < 7: img1[i+1, i] = 0.6
        img1 += np.random.normal(0, 0.1, (8, 8))
        X.append(np.clip(img1, 0, 1))
        y.append(1)

        # 2: Rune (Box / Diamond outline)
        img2 = np.zeros((8, 8), dtype=np.float32)
        img2[1, 1:7] = 0.9
        img2[6, 1:7] = 0.9
        img2[1:7, 1] = 0.9
        img2[1:7, 6] = 0.9
        img2 += np.random.normal(0, 0.1, (8, 8))
        X.append(np.clip(img2, 0, 1))
        y.append(2)

        # 3: Relic (Center core + 4 corner beacons)
        img3 = np.zeros((8, 8), dtype=np.float32)
        img3[3:5, 3:5] = 1.0
        img3[0, 0] = 0.9; img3[0, 7] = 0.9; img3[7, 0] = 0.9; img3[7, 7] = 0.9
        img3 += np.random.normal(0, 0.1, (8, 8))
        X.append(np.clip(img3, 0, 1))
        y.append(3)

    return np.array(X)[:, np.newaxis, :, :], np.array(y)

class AncientGlyphCNN(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv1 = nn.Conv2d(1, 4, kernel_size=3, padding=1) # 4 feature maps, 8x8
        self.pool = nn.MaxPool2d(2, 2) # 4 feature maps, 4x4
        self.conv2 = nn.Conv2d(4, 8, kernel_size=3, padding=1) # 8 feature maps, 4x4
        self.fc1 = nn.Linear(8 * 4 * 4, 32)
        self.fc2 = nn.Linear(32, 4)

    def forward(self, x):
        c1 = F.relu(self.conv1(x))
        p1 = self.pool(c1)
        c2 = F.relu(self.conv2(p1))
        flat = c2.view(c2.size(0), -1)
        f1 = F.relu(self.fc1(flat))
        out = self.fc2(f1)
        return out

    def inspect_features(self, x):
        # Returns activations of conv1, pool1, conv2 for inspection
        c1 = F.relu(self.conv1(x))
        p1 = self.pool(c1)
        c2 = F.relu(self.conv2(p1))
        flat = c2.view(c2.size(0), -1)
        f1 = F.relu(self.fc1(flat))
        out = self.fc2(f1)
        probs = F.softmax(out, dim=-1)

        return {
            "conv1_feature_maps": c1.detach().cpu().numpy()[0].tolist(), # [4, 8, 8]
            "pool1_feature_maps": p1.detach().cpu().numpy()[0].tolist(), # [4, 4, 4]
            "conv2_feature_maps": c2.detach().cpu().numpy()[0].tolist(), # [8, 4, 4]
            "logits": out.detach().cpu().numpy()[0].tolist(),
            "probabilities": probs.detach().cpu().numpy()[0].tolist()
        }

class OdysseyDLEngine:
    def __init__(self):
        self.cnn_model = AncientGlyphCNN()
        self._pretrain_cnn()

    def _pretrain_cnn(self):
        X, y = generate_glyph_dataset(160)
        X_t = torch.tensor(X, dtype=torch.float32)
        y_t = torch.tensor(y, dtype=torch.long)
        optimizer = optim.Adam(self.cnn_model.parameters(), lr=0.01)
        criterion = nn.CrossEntropyLoss()

        for _ in range(40):
            optimizer.zero_grad()
            out = self.cnn_model(X_t)
            loss = criterion(out, y_t)
            loss.backward()
            optimizer.step()

    def inspect_cnn_glyph(self, glyph_idx: int = 0, custom_matrix: List[List[float]] = None) -> Dict[str, Any]:
        if custom_matrix is not None:
            mat = np.array(custom_matrix, dtype=np.float32)
            if mat.shape != (8, 8):
                mat = np.resize(mat, (8, 8))
            img_tensor = torch.tensor(mat, dtype=torch.float32).unsqueeze(0).unsqueeze(0)
            chosen_name = "Custom Island Relic"
        else:
            X, y = generate_glyph_dataset(16)
            sample_idx = glyph_idx % 4
            mat = X[sample_idx][0]
            img_tensor = torch.tensor(mat, dtype=torch.float32).unsqueeze(0).unsqueeze(0)
            chosen_name = GLYPH_NAMES[sample_idx]

        feats = self.cnn_model.inspect_features(img_tensor)
        predicted_idx = int(np.argmax(feats["probabilities"]))

        return {
            "glyph_name": chosen_name,
            "input_matrix": mat.tolist(),
            "predicted_class": GLYPH_NAMES[predicted_idx],
            "confidence": round(float(feats["probabilities"][predicted_idx]), 4),
            "class_probabilities": {GLYPH_NAMES[i]: round(float(feats["probabilities"][i]), 4) for i in range(4)},
            "conv1_feature_maps": feats["conv1_feature_maps"],
            "pool1_feature_maps": feats["pool1_feature_maps"],
            "conv2_feature_maps": feats["conv2_feature_maps"]
        }

    def forward_pass_simulation(self, layer_sizes: List[int], activations: List[str], input_sample: List[float] = None) -> Dict[str, Any]:
        if not input_sample:
            input_sample = [0.65, -0.42] # Default 2D coordinate

        x_tensor = torch.tensor([input_sample], dtype=torch.float32)
        model = DynamicMLP(layer_sizes, activations)

        # Forward pass
        out, intermediates = model(x_tensor, capture_intermediates=True)

        # Mock target label 1 for loss calculation
        target_tensor = torch.tensor([1], dtype=torch.long)
        criterion = nn.CrossEntropyLoss()
        loss = criterion(out, target_tensor)

        # Compute real PyTorch backward pass to capture gradients
        loss.backward()

        gradients_per_layer = []
        for i, layer in enumerate(model.layers):
            w_grad_norm = float(torch.norm(layer.weight.grad).item()) if layer.weight.grad is not None else 0.0
            b_grad_norm = float(torch.norm(layer.bias.grad).item()) if layer.bias.grad is not None else 0.0
            gradients_per_layer.append({
                "layer_index": i + 1,
                "weight_grad_norm": round(w_grad_norm, 5),
                "bias_grad_norm": round(b_grad_norm, 5)
            })

        return {
            "input": input_sample,
            "intermediate_activations": intermediates,
            "output_logits": out.detach().cpu().numpy()[0].tolist(),
            "loss": round(float(loss.item()), 4),
            "gradients": gradients_per_layer
        }

    def train_mlp_dataset(self, layer_sizes: List[int], activations: List[str],
                          epochs: int = 35, lr: float = 0.05, batch_size: int = 32) -> Dict[str, Any]:
        X, y = generate_2d_dataset(300, noise=0.15)
        # Train / validation split (80 / 20)
        split_idx = int(0.8 * len(X))
        X_train, y_train = torch.tensor(X[:split_idx], dtype=torch.float32), torch.tensor(y[:split_idx], dtype=torch.long)
        X_val, y_val = torch.tensor(X[split_idx:], dtype=torch.float32), torch.tensor(y[split_idx:], dtype=torch.long)

        model = DynamicMLP(layer_sizes, activations)
        optimizer = optim.Adam(model.parameters(), lr=lr)
        criterion = nn.CrossEntropyLoss()

        history = []
        n_batches = int(np.ceil(len(X_train) / batch_size))

        for ep in range(1, epochs + 1):
            model.train()
            perm = torch.randperm(len(X_train))
            epoch_loss = 0.0
            correct = 0

            for b in range(n_batches):
                b_idx = perm[b * batch_size : (b + 1) * batch_size]
                bx, by = X_train[b_idx], y_train[b_idx]

                optimizer.zero_grad()
                out, _ = model(bx)
                loss = criterion(out, by)
                loss.backward()
                optimizer.step()

                epoch_loss += loss.item() * len(bx)
                preds = torch.argmax(out, dim=-1)
                correct += (preds == by).sum().item()

            train_loss = epoch_loss / len(X_train)
            train_acc = correct / len(X_train)

            # Evaluate on validation
            model.eval()
            with torch.no_grad():
                val_out, _ = model(X_val)
                val_loss = criterion(val_out, y_val).item()
                val_preds = torch.argmax(val_out, dim=-1)
                val_acc = (val_preds == y_val).sum().item() / len(y_val)

            history.append({
                "epoch": ep,
                "loss": round(train_loss, 4),
                "accuracy": round(train_acc, 3),
                "val_loss": round(val_loss, 4),
                "val_accuracy": round(val_acc, 3)
            })

        return {
            "history": history,
            "final_train_acc": round(history[-1]["accuracy"], 3),
            "final_val_acc": round(history[-1]["val_accuracy"], 3),
            "epochs_run": epochs
        }

    def run_overfitting_challenge(self, solutions: List[str]) -> Dict[str, Any]:
        """
        Baseline model on tiny noisy dataset overfits severely (~99% train, ~60% val).
        User applies solutions: 'dropout', 'regularization', 'reduce_complexity', 'data_augmentation'.
        Returns comparative training curves!
        """
        # Baseline overfitted data: only 30 training samples with noise
        np.random.seed(1337)
        torch.manual_seed(1337)
        n_train = 30
        n_val = 100

        # High-dimensional noisy features (10 features, only first 2 are signal)
        def make_noisy_data(n):
            X_signal = np.random.uniform(-1.5, 1.5, (n, 2))
            y = (X_signal[:, 0]**2 + X_signal[:, 1]**2 > 1.0).astype(np.int64)
            X_noise = np.random.normal(0, 0.8, (n, 8))
            return np.hstack([X_signal, X_noise]), y

        X_tr_np, y_tr_np = make_noisy_data(n_train)
        X_val_np, y_val_np = make_noisy_data(n_val)

        # If data augmentation chosen:
        if "data_augmentation" in solutions:
            X_extra, y_extra = make_noisy_data(120)
            X_tr_np = np.vstack([X_tr_np, X_extra])
            y_tr_np = np.concatenate([y_tr_np, y_extra])

        X_tr, y_tr = torch.tensor(X_tr_np, dtype=torch.float32), torch.tensor(y_tr_np, dtype=torch.long)
        X_vl, y_vl = torch.tensor(X_val_np, dtype=torch.float32), torch.tensor(y_val_np, dtype=torch.long)

        # Baseline model: oversized MLP (10 -> 64 -> 32 -> 2) without dropout or weight decay
        class BaselineOverfitModel(nn.Module):
            def __init__(self):
                super().__init__()
                self.net = nn.Sequential(
                    nn.Linear(10, 64),
                    nn.ReLU(),
                    nn.Linear(64, 32),
                    nn.ReLU(),
                    nn.Linear(32, 2)
                )
            def forward(self, x): return self.net(x)

        # Remediated model based on user selection:
        dropout_p = 0.4 if "dropout" in solutions else 0.0
        hidden_size = 8 if "reduce_complexity" in solutions else 48
        weight_decay = 0.02 if "regularization" in solutions else 0.0

        class RemediedModel(nn.Module):
            def __init__(self):
                super().__init__()
                self.net = nn.Sequential(
                    nn.Linear(10, hidden_size),
                    nn.ReLU(),
                    nn.Dropout(dropout_p),
                    nn.Linear(hidden_size, 2)
                )
            def forward(self, x): return self.net(x)

        # Train both models for 25 epochs
        crit = nn.CrossEntropyLoss()

        # 1. Baseline
        base_m = BaselineOverfitModel()
        base_opt = optim.Adam(base_m.parameters(), lr=0.03)
        base_curve = []
        for ep in range(1, 26):
            base_m.train()
            base_opt.zero_grad()
            out = base_m(X_tr[:30]) # keep baseline on small set
            loss = crit(out, y_tr[:30])
            loss.backward()
            base_opt.step()

            tr_acc = (torch.argmax(out, dim=-1) == y_tr[:30]).sum().item() / 30.0
            base_m.eval()
            with torch.no_grad():
                val_out = base_m(X_vl)
                val_acc = (torch.argmax(val_out, dim=-1) == y_vl).sum().item() / len(y_vl)
            base_curve.append({
                "epoch": ep,
                "train_acc": round(tr_acc * 100, 1),
                "val_acc": round(val_acc * 100, 1),
                "loss": round(loss.item(), 3)
            })

        # 2. Remedied
        rem_m = RemediedModel()
        rem_opt = optim.Adam(rem_m.parameters(), lr=0.015, weight_decay=weight_decay)
        remedied_curve = []
        for ep in range(1, 26):
            rem_m.train()
            rem_opt.zero_grad()
            out = rem_m(X_tr)
            loss = crit(out, y_tr)
            loss.backward()
            rem_opt.step()

            tr_acc = (torch.argmax(out, dim=-1) == y_tr).sum().item() / len(X_tr)
            rem_m.eval()
            with torch.no_grad():
                val_out = rem_m(X_vl)
                val_acc = (torch.argmax(val_out, dim=-1) == y_vl).sum().item() / len(y_vl)
            remedied_curve.append({
                "epoch": ep,
                "train_acc": round(tr_acc * 100, 1),
                "val_acc": round(val_acc * 100, 1),
                "loss": round(loss.item(), 3)
            })

        base_final_val = base_curve[-1]["val_acc"]
        rem_final_val = remedied_curve[-1]["val_acc"]
        gap_reduced = (base_curve[-1]["train_acc"] - base_final_val) - (remedied_curve[-1]["train_acc"] - rem_final_val)

        return {
            "selected_solutions": solutions,
            "baseline_history": base_curve,
            "remedied_history": remedied_curve,
            "baseline_final": {"train": base_curve[-1]["train_acc"], "val": base_final_val},
            "remedied_final": {"train": remedied_curve[-1]["train_acc"], "val": rem_final_val},
            "improvement": round(rem_final_val - base_final_val, 1),
            "is_resolved": bool(rem_final_val >= 78.0 and (remedied_curve[-1]["train_acc"] - rem_final_val) < 18.0),
            "diagnosis": "Excellent! Generalization gap successfully closed." if rem_final_val >= 78.0 else "Generalization is still lagging. Combine dropout or data augmentation to stabilize validation accuracy."
        }

    def generate_adversarial_example(self, glyph_idx: int = 0, epsilon: float = 0.25) -> Dict[str, Any]:
        """
        Fast Gradient Sign Method (FGSM):
        x_adv = x + eps * sign(grad_x(Loss))
        Demonstrates how small imperceptible perturbations trick the ancient vision model.
        """
        X, y = generate_glyph_dataset(16)
        sample_idx = glyph_idx % 4
        orig_img_np = X[sample_idx]
        true_label = int(y[sample_idx])

        # Convert to PyTorch tensor with grad enabled
        x_tensor = torch.tensor(orig_img_np, dtype=torch.float32).unsqueeze(0) # [1, 1, 8, 8]
        x_tensor.requires_grad = True

        # Forward pass through CNN
        logits = self.cnn_model(x_tensor)
        orig_probs = F.softmax(logits, dim=-1).detach().cpu().numpy()[0]
        orig_pred = int(np.argmax(orig_probs))

        # Compute loss with respect to original label
        target = torch.tensor([true_label], dtype=torch.long)
        criterion = nn.CrossEntropyLoss()
        loss = criterion(logits, target)

        # PyTorch Autograd backwards to get dL/dx
        self.cnn_model.zero_grad()
        loss.backward()
        data_grad = x_tensor.grad.data

        # Compute FGSM perturbation: eps * sign(data_grad)
        sign_data_grad = data_grad.sign()
        perturbed_tensor = x_tensor + epsilon * sign_data_grad
        perturbed_tensor = torch.clamp(perturbed_tensor, 0, 1).detach()

        # Run perturbed image through model
        adv_logits = self.cnn_model(perturbed_tensor)
        adv_probs = F.softmax(adv_logits, dim=-1).detach().cpu().numpy()[0]
        adv_pred = int(np.argmax(adv_probs))

        perturbation_np = (perturbed_tensor - x_tensor).detach().cpu().numpy()[0][0]

        return {
            "epsilon": epsilon,
            "original": {
                "glyph_name": GLYPH_NAMES[orig_pred],
                "matrix": orig_img_np[0].tolist(),
                "confidence": round(float(orig_probs[orig_pred]), 4),
                "probabilities": {GLYPH_NAMES[i]: round(float(orig_probs[i]), 4) for i in range(4)}
            },
            "perturbation_noise": perturbation_np.tolist(),
            "adversarial": {
                "glyph_name": GLYPH_NAMES[adv_pred],
                "matrix": perturbed_tensor.cpu().numpy()[0][0].tolist(),
                "confidence": round(float(adv_probs[adv_pred]), 4),
                "probabilities": {GLYPH_NAMES[i]: round(float(adv_probs[i]), 4) for i in range(4)}
            },
            "attack_successful": bool(adv_pred != orig_pred),
            "explanation": f"The FGSM attack added subtle gradient noise (eps={epsilon}), flipping the network's prediction from {GLYPH_NAMES[orig_pred]} ({round(float(orig_probs[orig_pred])*100, 1)}%) to {GLYPH_NAMES[adv_pred]} ({round(float(adv_probs[adv_pred])*100, 1)}%)."
        }

# --- RUNE CASTER CNN: Real 16x16 Interactive Drawing Classifier ---
RUNE_CLASSES = ["Flame", "Wave", "Lightning", "Shield", "Compass"]

def generate_rune_dataset(samples_per_class=120):
    X = []
    y = []
    for _ in range(samples_per_class):
        # 0: Flame (Triangle / teardrop peak)
        img0 = np.zeros((16, 16), dtype=np.float32)
        top_c = 7 + np.random.randint(-1, 2)
        for r in range(3, 14):
            spread = int((r - 3) * 0.45)
            c1 = max(0, top_c - spread)
            c2 = min(15, top_c + spread)
            img0[r, c1:c2+1] = np.random.uniform(0.7, 1.0)
        img0 += np.random.normal(0, 0.05, (16, 16))
        X.append(np.clip(img0, 0, 1))
        y.append(0)

        # 1: Wave (Horizontal sinusoidal ripples)
        img1 = np.zeros((16, 16), dtype=np.float32)
        phase = np.random.uniform(0, np.pi)
        for c in range(16):
            r1 = int(np.clip(6 + np.sin(c * 0.6 + phase) * 2.5, 2, 14))
            r2 = int(np.clip(11 + np.sin(c * 0.6 + phase) * 2.5, 2, 14))
            img1[r1, c] = 0.95
            img1[r2, c] = 0.85
            if r1 > 0: img1[r1 - 1, c] = 0.4
            if r2 < 15: img1[r2 + 1, c] = 0.4
        img1 += np.random.normal(0, 0.05, (16, 16))
        X.append(np.clip(img1, 0, 1))
        y.append(1)

        # 2: Lightning (Sharp diagonal zig-zag)
        img2 = np.zeros((16, 16), dtype=np.float32)
        shift = np.random.randint(-1, 2)
        for r in range(2, 7): # Upper slash
            c = int(8 + (r - 4) * 0.8) + shift
            if 0 <= c < 16: img2[r, c] = 0.95
        for c in range(4 + shift, 12 + shift): # Horizontal bar
            if 0 <= c < 16: img2[7, c] = 0.95
        for r in range(8, 14): # Lower slash
            c = int(7 + (r - 10) * 0.8) + shift
            if 0 <= c < 16: img2[r, c] = 0.95
        img2 += np.random.normal(0, 0.05, (16, 16))
        X.append(np.clip(img2, 0, 1))
        y.append(2)

        # 3: Shield (U-shaped outer curve / crest)
        img3 = np.zeros((16, 16), dtype=np.float32)
        for c in range(3, 13):
            img3[3, c] = 0.9 # top bar
        for r in range(3, 11):
            img3[r, 3] = 0.9
            img3[r, 12] = 0.9
        # bottom point
        for r in range(11, 15):
            d = (r - 11) * 2
            if 3 + d <= 12 - d:
                img3[r, 3 + d : 13 - d] = 0.9
        img3 += np.random.normal(0, 0.05, (16, 16))
        X.append(np.clip(img3, 0, 1))
        y.append(3)

        # 4: Compass (Orthogonal plus / cross)
        img4 = np.zeros((16, 16), dtype=np.float32)
        img4[7:9, 2:14] = 0.95
        img4[2:14, 7:9] = 0.95
        # 4 tip points
        img4[1, 8] = 0.8; img4[14, 8] = 0.8; img4[8, 1] = 0.8; img4[8, 14] = 0.8
        img4 += np.random.normal(0, 0.05, (16, 16))
        X.append(np.clip(img4, 0, 1))
        y.append(4)

    return np.array(X)[:, np.newaxis, :, :], np.array(y)

class RuneCasterCNN(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv1 = nn.Conv2d(1, 8, kernel_size=3, padding=1)
        self.pool1 = nn.MaxPool2d(2, 2) # 8x8
        self.conv2 = nn.Conv2d(8, 16, kernel_size=3, padding=1)
        self.pool2 = nn.MaxPool2d(2, 2) # 4x4
        self.fc1 = nn.Linear(16 * 4 * 4, 32)
        self.fc2 = nn.Linear(32, 5)

    def forward(self, x):
        c1 = F.relu(self.conv1(x))
        p1 = self.pool1(c1)
        c2 = F.relu(self.conv2(p1))
        p2 = self.pool2(c2)
        flat = p2.view(p2.size(0), -1)
        f1 = F.relu(self.fc1(flat))
        out = self.fc2(f1)
        return out

    def extract_conv1_maps(self, x):
        c1 = F.relu(self.conv1(x))
        return c1.detach().cpu().numpy()[0]

class OdysseyDLEngineExtension:
    def __init__(self, base_engine: OdysseyDLEngine):
        self.base = base_engine
        self.rune_cnn = RuneCasterCNN()
        self._train_rune_cnn()

    def _train_rune_cnn(self):
        X, y = generate_rune_dataset(120)
        X_t = torch.tensor(X, dtype=torch.float32)
        y_t = torch.tensor(y, dtype=torch.long)
        opt = optim.Adam(self.rune_cnn.parameters(), lr=0.01)
        crit = nn.CrossEntropyLoss()
        for _ in range(35):
            opt.zero_grad()
            out = self.rune_cnn(X_t)
            loss = crit(out, y_t)
            loss.backward()
            opt.step()

    def classify_drawing(self, matrix_16x16: List[List[float]]) -> Dict[str, Any]:
        mat = np.array(matrix_16x16, dtype=np.float32)
        if mat.shape != (16, 16):
            mat = np.resize(mat, (16, 16))
        # Ensure values in [0, 1]
        if mat.max() > 1.0:
            mat = mat / 255.0

        x_t = torch.tensor(mat, dtype=torch.float32).unsqueeze(0).unsqueeze(0)
        logits = self.rune_cnn(x_t)
        probs = F.softmax(logits, dim=-1).detach().cpu().numpy()[0]
        pred_idx = int(np.argmax(probs))
        confidence = float(probs[pred_idx])

        conv1_maps = self.rune_cnn.extract_conv1_maps(x_t)

        return {
            "predicted_rune": RUNE_CLASSES[pred_idx],
            "confidence": round(confidence, 4),
            "gate_unlocked": bool(confidence >= 0.70),
            "all_probabilities": {RUNE_CLASSES[i]: round(float(probs[i]), 4) for i in range(5)},
            "conv1_feature_maps": [conv1_maps[i].tolist() for i in range(4)],
            "drawing_matrix": mat.tolist()
        }

    def glitch_drawing_fgsm(self, matrix_16x16: List[List[float]], epsilon: float = 0.28) -> Dict[str, Any]:
        mat = np.array(matrix_16x16, dtype=np.float32)
        if mat.shape != (16, 16):
            mat = np.resize(mat, (16, 16))

        x_t = torch.tensor(mat, dtype=torch.float32).unsqueeze(0).unsqueeze(0)
        x_t.requires_grad = True

        logits = self.rune_cnn(x_t)
        orig_probs = F.softmax(logits, dim=-1).detach().cpu().numpy()[0]
        orig_idx = int(np.argmax(orig_probs))

        target = torch.tensor([orig_idx], dtype=torch.long)
        crit = nn.CrossEntropyLoss()
        loss = crit(logits, target)

        self.rune_cnn.zero_grad()
        loss.backward()
        data_grad = x_t.grad.data

        # Compute FGSM perturbation
        perturbed = torch.clamp(x_t + epsilon * data_grad.sign(), 0, 1).detach()
        adv_logits = self.rune_cnn(perturbed)
        adv_probs = F.softmax(adv_logits, dim=-1).detach().cpu().numpy()[0]
        adv_idx = int(np.argmax(adv_probs))

        noise_np = (perturbed - x_t).detach().cpu().numpy()[0][0]

        return {
            "epsilon": epsilon,
            "original_rune": RUNE_CLASSES[orig_idx],
            "original_confidence": round(float(orig_probs[orig_idx]), 4),
            "adversarial_rune": RUNE_CLASSES[adv_idx],
            "adversarial_confidence": round(float(adv_probs[adv_idx]), 4),
            "attack_successful": bool(adv_idx != orig_idx),
            "perturbed_matrix": perturbed.cpu().numpy()[0][0].tolist(),
            "noise_matrix": noise_np.tolist(),
            "explanation": f"The FGSM attack injected gradient noise (eps={epsilon}), causing the PyTorch CNN to misclassify your {RUNE_CLASSES[orig_idx]} as a {RUNE_CLASSES[adv_idx]} with {round(float(adv_probs[adv_idx])*100, 1)}% confidence!"
        }

dl_engine = OdysseyDLEngine()
dl_rune_caster = OdysseyDLEngineExtension(dl_engine)


