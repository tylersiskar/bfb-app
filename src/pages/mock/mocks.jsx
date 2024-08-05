import { Content } from "../../components/layout";
import { Button } from "../../components/buttons";
import "../home/home.scss";
import "./mocks.scss";
import { useGetMocksQuery } from "../../api/bfbApi";
import { Link } from "react-router-dom";
import { groupBy } from "lodash";

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
            let roundOne = mock.picks.filter((m) => m.round === 1);
            let positionalGrouping = groupBy(roundOne, "pos");
            console.log(positionalGrouping);
            return (
              <Link
                className="p-3 border-bottom mock-item"
                key={mock.name}
                to={`/mocks/${mock.id}`}
              >
                <p className="light bold pb-1">{mock.name}</p>
                <p className="light">{mock.create_date.split("T")[0]}</p>
                {/* <div className="flex w-100 justify-end">
                  <p className="light md pr-1">1st Round:</p>
                  {Object.keys(positionalGrouping).map((pos) => (
                    <p className="light md pr-1">{`${positionalGrouping[pos].length} ${pos} `}</p>
                  ))}
                </div> */}
              </Link>
            );
          })}
        </div>
      </div>
    </Content>
  );
};

export default MockDraftCenter;
