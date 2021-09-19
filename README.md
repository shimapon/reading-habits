# reading-habits-app

### 読書習慣をつけるアプリ

## 技術

- Next.js(React.FC)
- firestore

### Style

- tailwindCSS

  - headlessUI

#### Icon

- heroicons

## テーマ

- 日々，本を読んだ感想(まとめとかなんでも良い)を投稿する。
- 投稿は望めば共有され、共有ページでは同じ本を読んでいる人の投稿を見て、理解を深めたり読書するモチベーションにもつながる。
- 本自体の感想を投稿するアプリはあるが、このアプリは**読書習慣をつける**ためのもので、一日に読めた本の**一部**(第 1 章や、p.2-23 など)**ごとでの投稿**を望むものである。

## 用途

1. ユーザが本を読む．
1. アプリを開き，今回読んだ本を選ぶ(登録していなければ，新しく登録する)
1. 読んだ部分を書き，コメントを書いて投稿する．

## 画面設計

### ホーム画面:これまでに登録した本を選び，投稿

<img src="https://user-images.githubusercontent.com/38938327/107852535-96213900-6e54-11eb-8f71-0bd2386ce465.jpg" width=21% /><img src="https://user-images.githubusercontent.com/38938327/107852533-94577580-6e54-11eb-9f19-496886bdefb3.jpg" width=30% /><img src="https://user-images.githubusercontent.com/38938327/107852536-96b9cf80-6e54-11eb-88ca-fcbdcf72559e.jpg" width=30% />

### シェア画面:投稿された本の一覧から Line のようにコメントを見られる

<img src="https://user-images.githubusercontent.com/38938327/107852537-97526600-6e54-11eb-9e53-ba18c4107026.jpg" width=21% /><img src="https://user-images.githubusercontent.com/38938327/107852538-97eafc80-6e54-11eb-9664-a84690876261.jpg" width=21% />
