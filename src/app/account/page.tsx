import Header from "../../components/Header";
import AccountContent from "./components/AccountContent";

export default function Account() {
  return (
    <div className="h-full w-full overflow-hidden overflow-y-auto rounded-lg bg-delft_blue">
      <Header className="from-bg-delft_blue">
        <div className="mb-2 flex flex-col gap-y-6">
          <h1 className="text-3xl font-semibold text-white">
            Настройки аккаунта
          </h1>
        </div>
      </Header>
      <AccountContent />
    </div>
  );
}
