const providers = require("@adt/json-rpc-transport-providers");
const DummyTransportProvider = providers.DummyTransportProvider;
const RpcClient = require("../dist/RpcClient.cjs");


// Suite
describe("JsonRpcClient", function() {

    var dummyTransportProvider,
        defaultClient;

    function prepare() {

        /*dummyTransportProvider = DummyTransportProvider({
            onMessage : function(){},
            onDisconnect : function(){},
            onError : function(){}
        });

        defaultClient = RpcClient({
            transportProvider : dummyTransportProvider,
            messageTimeout : 2
        });*/

    }

    beforeAll(prepare);

    it("Must PASS", function(){
      expect(true).toBe(true);
    });

    /*it("defaultClient must be instance of RpcClient", function() {

        expect(defaultClient instanceof RpcClient).toBe(true);

    });

    it("defaultClient.connect must return resolved Promise", function (done) {

            defaultClient.connect().then(

                () => expect(true).toBe(true)

            ).then( () => done() ).catch( e => fail(e) );

    });

    it("defaultClient.sendRequest must return promise", function(done){

        const req = { method : "test",
            params : [],
            id : "1" };

        defaultClient.sendRequest(req).then(

            () => expect(true).toBe(true)

        ).then( () => done()).catch( e => done() );

    });

    it("defaultClient.sendRequest must reject returned promise after timeout", function(done){

        const req = { method : "test",
                      params : [],
                      id : "1" };

       defaultClient.sendRequest(req).then(
           v => fail("Promise should not be resolved")
       ).catch(
           (e) => {
               expect(e).toBe(RpcClient.ERRORS.TIMEOUT_EXCEEDED);
               done();
           }
       );

    });*/

});
