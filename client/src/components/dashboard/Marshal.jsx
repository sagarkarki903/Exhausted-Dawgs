import LogOutTest from '../../LogOutTest';
import Scheduler from '../scheduling/Scheduler';

const Marshal = () => {

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Marshal Dashboard</h2>
      <LogOutTest />
      <Scheduler />
    </div>
  );
};

export default Marshal;