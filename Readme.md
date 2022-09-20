# Hubble Teams app

## 環境
 ```
 node 16.x
 ```
## ローカル起動
1. `.env.sample`をコピーして `.env`を作成。実際の値に関してはAzure上でBot Serviceを作成するか、fujii@hubble-inc.jpまで
2.  `node index.js`

## deploy
AppRunnerで起動
 ```
 $ aws ecr get-login-password | docker login --username AWS --password-stdin https://482744801596.dkr.ecr.ap-northeast-1.amazonaws.com

 $ docker build --platform=linux/x86_64 -t 482744801596.dkr.ecr.ap-northeast-1.amazonaws.com/teams . &&  docker push 482744801596.dkr.ecr.ap-northeast-1.amazonaws.com/teams
 ```