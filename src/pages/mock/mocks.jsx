import { Content } from "../../components/layout";
import { Button } from "../../components/buttons";
import "../home/home.scss";
import { useGetMocksQuery } from "../../api/bfbApi";

const MockDraftCenter = () => {
  const { data: mocks, isLoading } = useGetMocksQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  return (
    <Content dark isLoading={isLoading}>
      <div className="home-body" style={{ padding: "0 16px" }}>
        <div className="flex justify-between">
          <h2>Mock Draft Center</h2>
          <div style={{ width: 100 }}>
            <Button
              className="bg-lime button-sm flex justify-center align-center p-1"
              style={{
                borderColor: "#54d846",
              }}
              href="/mocks/new"
            >
              <p className="sm dark bold">CREATE NEW</p>
            </Button>
          </div>
        </div>
        <div className="flex flex-column w-100" style={{ paddingBottom: 24 }}>
          <h3 className="yellow pb-1">Created Mocks</h3>
          {mocks?.map((mock) => {
            return (
              <div className="flex justify-between w-100 p-2 border-bottom">
                <div className="flex flex-column align-start">
                  <p className="light bold pb-1">{mock.name}</p>
                  <p className="light sm">
                    Created: {mock.create_date.split("T")[0]}
                  </p>
                </div>
                <div className="flex flex-column align-end">
                  <p className="light bold pb-1">Top Pick</p>
                  <p className="light sm">
                    {mock.picks[0].first_name} {mock.picks[0].last_name}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Content>
  );
};

export default MockDraftCenter;
