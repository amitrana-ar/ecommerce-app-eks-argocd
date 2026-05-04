# Node.js E-commerce Application

This is an e-commerce store application built using Node.js, Express.js, and EJS. The application follows the MVC (Model-View-Controller) architecture and integrates RESTful APIs for efficient data handling. The application features dynamic routing, robust database interactions through Sequelize ORM, role-based user authentication, admin-driven product management, and customer-focused shopping cart functionalities.

![Alt text](Argocd-EKS-Diagram.png)

# 🚀 E-Commerce Microservices Deployment (EKS + GitOps)

## 📌 Overview

This project demonstrates a **production-style deployment** of a Node.js-based e-commerce application using:

* Kubernetes (EKS)
* GitOps (ArgoCD)
* Docker (ECR)
* Ingress (NGINX)
* Monitoring (Prometheus + Grafana)
* Autoscaling (HPA)
* CI/CD (GitHub Actions)

---

## 🏗️ Architecture

```
GitHub → ArgoCD → EKS Cluster → Pods (EC2 Nodes)
                ↓
            Ingress (LoadBalancer)
                ↓
             Domain Access
```

---

## 📂 Project Structure

```
.
├── app.js / services / routes / controllers
├── Dockerfile
├── k8s/
│   ├── deployments (frontend, cart, order, product)
│   ├── services
│   ├── HPA configs
│   ├── ingress.yml
│   ├── argocd.yml
│   ├── grafana / prometheus configs
│   ├── cronjob.yml (ECR secret refresh)
├── kind-config.yaml (local setup)
├── ecommerce-secret (DB reference)
```

---

# ⚙️ Prerequisites (Local Machine)

Install the following tools:

### 1. kubectl

```bash
sudo apt install kubectl -y
```

### 2. AWS CLI

```bash
sudo apt install awscli -y
aws configure
```

### 3. eksctl

```bash
curl -sL https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_Linux_amd64.tar.gz | tar xz
sudo mv eksctl /usr/local/bin
```

### 4. Helm

```bash
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

### 5. ArgoCD CLI (optional)

```bash
curl -sSL -o argocd https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
chmod +x argocd
sudo mv argocd /usr/local/bin/
```

---

# ☁️ EKS Setup

### Create Cluster

```bash
eksctl create cluster --name ecommerce --region <region>
```

### Configure Access

```bash
aws eks update-kubeconfig --region <region> --name ecommerce
```

---

# 📦 Namespace Setup

```bash
kubectl create namespace ecommerce
kubectl create namespace monitoring
kubectl create namespace argocd
```

---

# 🔐 Secret Setup (Database)

```bash
kubectl create secret generic ecommerce-secret \
  --from-literal=DB_HOST_URL=<host> \
  --from-literal=DB_USER_NAME=<user> \
  --from-literal=DB_USER_PASSWORD=<password> \
  --from-literal=DB_SCHEMA_NAME=<db> \
  --from-literal=DB_PORT=<port> \
  -n ecommerce
```

---

# 🚀 Deploy Application (GitOps)

### Install ArgoCD

```bash
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

### Access ArgoCD

```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

---

### Apply ArgoCD Application

```bash
kubectl apply -f k8s/argocd.yml
```

---

# 🌐 Ingress Setup

### Install NGINX Ingress

```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx --create-namespace
```

---

### Verify

```bash
kubectl get pods -n ingress-nginx
kubectl get svc -n ingress-nginx
```

---

# 🔒 SSL Setup (cert-manager)

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/latest/download/cert-manager.yaml
```

### Verify

```bash
kubectl get pods -n cert-manager
```

---

# 📊 Monitoring Setup

### Install Prometheus + Grafana

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install monitoring prometheus-community/kube-prometheus-stack \
  -n monitoring --create-namespace
```

---

### Access Grafana

```bash
kubectl port-forward svc/monitoring-grafana -n monitoring 3000:80
```

---

### Get Password

```bash
kubectl get secret monitoring-grafana -n monitoring \
  -o jsonpath="{.data.admin-password}" | base64 --decode
```

---

# 📈 HPA (Autoscaling)

Apply:

```bash
kubectl apply -f k8s/*-hpa.yml
```

Verify:

```bash
kubectl get hpa -n ecommerce
```

---

# 🔁 ECR Secret Auto Refresh

CronJob already defined:

```
k8s/cronjob.yml
```

Apply:

```bash
kubectl apply -f k8s/cronjob.yml
```

---

# 🔍 Debugging Commands

```bash
kubectl get pods -A
kubectl get svc -A
kubectl get ingress -A
kubectl logs <pod>
kubectl describe pod <pod>
```

---

# ⚠️ Important Notes

### GitOps Rule

```
DO NOT use kubectl apply for permanent changes
```

✔ Always:

```
Edit YAML → Commit → Push → ArgoCD Sync
```

---

### Local vs Cluster

```
Local Machine → Only for access/tools
EKS Cluster → Runs everything
```

---

# 🔄 Deployment Flow

```
Code Change → GitHub Push → ArgoCD Sync → EKS Update
```

---

# 📌 Access Points

| Component   | Access Method |
| ----------- | ------------- |
| Application | via Ingress   |
| ArgoCD      | Web UI        |
| Grafana     | Web UI        |
| Kubernetes  | kubectl       |

---

# 🧠 Best Practices

* Use Git as source of truth
* Avoid manual cluster changes
* Monitor via Grafana
* Use HPA for scaling
* Keep secrets secure

---

# ✅ Summary

This project demonstrates:

* Kubernetes microservices deployment
* GitOps-based CI/CD
* Scalable architecture with HPA
* Monitoring with Prometheus & Grafana
* Secure and production-ready setup

---

# 🚀 Future Improvements

* Multi-environment (dev/staging/prod)
* AWS ALB instead of NGINX
* External Secrets Manager
* Alerting system (email/slack)
* Backup & disaster recovery

---
