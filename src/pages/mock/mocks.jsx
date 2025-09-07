import { Content } from "../../components/layout";
import { Button } from "../../components/buttons";
import "../home/home.scss";
import "./mocks.scss";
import { useGetMocksQuery } from "../../api/bfbApi";
import { Link } from "react-router-dom";
import { groupBy } from "lodash";
import { createPortal } from "react-dom";
import { useState } from "react";
import Select from "react-select";
import { useGetUsersQuery } from "../../api/api";

const MockDraftCenter = () => {
  const [showModal, setShowModal] = useState(false);
  const [mockState, setMockState] = useState({});
  const { data: users, isFetching: usersIsFetching } = useGetUsersQuery();
  const { data: mocks, isLoading } = useGetMocksQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  let userOptions = users?.map((usr) => ({
    label: usr.display_name,
    value: usr.user_id,
  }));
  return (
    <Content dark isLoading={isLoading}>
      <div className="home-body" style={{ padding: "0 16px" }}>
        <div className="flex justify-between">
          <h2>Mock Draft Center</h2>
          <>
            <div style={{ width: 100 }}>
              <Button
                className="bg-lime button-sm flex justify-center align-center p-1"
                style={{
                  borderColor: "#54d846",
                }}
                onClick={() => setShowModal(true)}
              >
                <p className="sm dark bold">CREATE NEW</p>
              </Button>
            </div>
            {showModal &&
              createPortal(
                <div className="modal-overlay">
                  <div className="modal bg-dark">
                    <div className="flex flex-column justify-between h-100">
                      <div>
                        <h3 className="pb-2">New Mock Draft</h3>
                        <h6 className="pb-1">Select your username</h6>
                        <Select
                          options={userOptions}
                          onChange={(obj) =>
                            setMockState({ ...mockState, name: obj.label })
                          }
                          isSearchable={false}
                        />
                      </div>
                      <div className="d-flex w-100 justify-end">
                        <Button
                          className="bg-lime button-sm flex justify-center align-center p-1"
                          style={{
                            borderColor: "#54d846",
                            width: 100,
                          }}
                          href="/mocks/new"
                          state={mockState}
                        >
                          <p className="sm dark bold">Go Draft!</p>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>,
                document.body
              )}
          </>
        </div>
        <div className="flex flex-column w-100" style={{ paddingBottom: 24 }}>
          <h3 className="yellow pb-3">Created Mocks</h3>
          {mocks?.map((mock) => {
            let positionalGrouping = groupBy(mock.picks, "pos");
            return (
              <Link
                className="p-3 mock-item"
                key={mock.id}
                to={`/mocks/${mock.id}`}
              >
                <div className="flex flex-column w-100 justify-start align-start">
                  <p className="light bold pb-1">{mock.name}</p>
                  <p className="light pb-1">{mock.create_date.split("T")[0]}</p>
                </div>
                <div className="flex pt-1">
                  {Object.keys(positionalGrouping).map((pos, i) => (
                    <div
                      className={`${pos} p-1`}
                      style={{ borderRadius: 4, marginRight: 4 }}
                      key={pos}
                    >
                      {" "}
                      <p
                        className={`bold dark md pr-${
                          Object.keys(positionalGrouping).length - 1 === i
                            ? 0
                            : 1
                        }`}
                      >{`${positionalGrouping[pos].length} ${pos} `}</p>
                    </div>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </Content>
  );
};

export default MockDraftCenter;
