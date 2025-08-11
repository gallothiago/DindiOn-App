# DindiOn-App


O DindiOn-App é uma aplicação web para controle financeiro pessoal, desenvolvida em **React.js**. Ele oferece uma forma intuitiva e eficiente de gerenciar suas finanças, permitindo registrar despesas e receitas, acompanhar saldos e categorizar transações diretamente do navegador.

## ✨ Recursos

* **Registro de Transações:** Adicione rapidamente despesas e receitas com detalhes como valor, data e descrição.
* **Categorização:** Organize suas transações em categorias personalizadas para uma análise mais clara dos seus gastos.
* **Visão Geral do Saldo:** Monitore seu saldo total e por período, garantindo que você sempre saiba sua situação financeira.
* **Análise de Dados:** Gráficos e relatórios visuais que ajudam a entender seus hábitos de consumo.
* **Design Intuitivo:** Uma interface limpa e fácil de usar, projetada para uma ótima experiência do usuário.

## 🚀 Como Executar o Projeto

Siga estes passos para configurar e rodar o projeto em sua máquina local.

### Pré-requisitos

Certifique-se de ter o seguinte instalado em seu ambiente:

* [**Node.js**](https://nodejs.org/en/): Versão 18 ou superior.
* [**Yarn**](https://classic.yarnpkg.com/en/docs/install/): Gerenciador de pacotes, recomendado para este projeto.

### Instalação

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/gallothiago/DindiOn-App.git](https://github.com/gallothiago/DindiOn-App.git)
    cd DindiOn-App
    ```

2.  **Instale as dependências:**
    ```bash
    yarn install
    ```

3.  **Configuração do Firebase:**
    Este projeto usa o **Firebase** para o backend. Você precisará configurar seu próprio projeto no console do Firebase. Crie um arquivo `.env` na raiz do projeto e adicione suas credenciais:
    
    ```
    REACT_APP_FIREBASE_API_KEY=sua_api_key
    REACT_APP_FIREBASE_AUTH_DOMAIN=seu_auth_domain
    REACT_APP_FIREBASE_PROJECT_ID=seu_project_id
    REACT_APP_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
    REACT_APP_FIREBASE_MESSAGING_SENDER_ID=seu_Messaginger_id
    REACT_APP_FIREBASE_APP_ID=seu_app_id
    ```
    *Obs: Não suba o arquivo `.env` para o GitHub.*

4.  **Execute a aplicação:**
    ```bash
    yarn dev
    ```

A aplicação estará disponível em `http://localhost:5173` ou na porta especificada pelo seu projeto.

## 🛠️ Tecnologias Utilizadas

* **[React.js](https://react.dev/)**: Biblioteca JavaScript para construção de interfaces de usuário.
* **[TypeScript](https://www.typescriptlang.org/)**: Superset do JavaScript que adiciona tipagem estática.
* **[Firebase](https://firebase.google.com/)**: Plataforma de desenvolvimento de aplicativos do Google, usada como backend para autenticação e banco de dados.
* **[Styled-components](https://styled-components.com/)**: Biblioteca para estilização de componentes com CSS-in-JS.
* **[Date-fns](https://date-fns.org/)**: Biblioteca para manipulação de datas.
* **[React Router](https://reactrouter.com/en/main)**: Biblioteca de roteamento para navegação entre páginas.

## 🤝 Como Contribuir

Fico feliz com a sua contribuição para o projeto! Siga os passos abaixo:

1.  **Faça um Fork** do projeto.
2.  **Crie uma nova branch** para sua funcionalidade ou correção de bug: `git checkout -b feature/sua-feature`.
3.  **Faça suas alterações** e comite-as com uma mensagem clara: `git commit -m 'feat: Adiciona nova funcionalidade X'`.
4.  **Envie para a sua branch** no GitHub: `git push origin feature/sua-feature`.
5.  **Abra um Pull Request** detalhando as mudanças.

## ✒️ Autor

* **Thiago Gallo** - [GitHub](https://github.com/gallothiago)

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE.md](LICENSE.md) para mais detalhes.
